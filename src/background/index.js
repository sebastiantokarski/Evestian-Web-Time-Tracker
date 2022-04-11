import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { INTERVAL_UPDATE_S, INTERVAL_UPDATE_MIN, ALL_TIME_KEY, FIRST_STARTUP_KEY } from 'js/config';
import { debugLog, getActiveTab, getFromUrl, isWindowActive, isSoundFromTab } from 'js/utils';
import DataManagement from '../js/DataManagement';
import settings from '../js/settings';

class Background {
  /**
   * Constructor.
   */
  constructor() {
    this.currentState = chrome.idle.IdleState.ACTIVE;
    this.setBeforeSave = [];
    this.dataManagement = new DataManagement();
    this.dataManagement.loadFromStorage();
  }

  /**
   * Check if url is blacklisted.
   *
   * @param  {string} url
   * @return {boolean}
   */
  static isURLOnBlacklist(url) {
    const blacklistedURLs = settings.BLACKLISTED_URLS;

    return (
      blacklistedURLs.filter((blacklistedUrl) => {
        const regex = new RegExp(blacklistedUrl);

        return regex.test(url);
      }).length > 0
    );
  }

  /**
   * Is current state active.
   *
   * @todo There should be also check mouserover event (can be blur and mouseover in one time).
   *
   * @param  {string} state - 'active', 'idle' or 'locked'.
   * @return {boolean}
   */
  static isStateActive(state) {
    if (settings.COUNTY_ONLY_ACTIVE_STATE) {
      return chrome.idle.IdleState.ACTIVE === state;
    }
    return true;
  }

  /**
   * Update badge on the extension icon.
   *
   * @param {object} tab
   * @param {string} hostname
   */
  updateBadge(tab, hostname) {
    const timeInSeconds = this.dataManagement.getDayOfTheMonthData(hostname)[ALL_TIME_KEY];
    let tabTime = 0;

    if (timeInSeconds < 60) {
      tabTime = `${timeInSeconds}s`;
    } else if (timeInSeconds < 60 * 100) {
      tabTime = `${Math.floor(timeInSeconds / 60)}m`;
    } else {
      tabTime = `${Math.floor(timeInSeconds / 60 / 60)}h`;
    }

    chrome.browserAction.setBadgeText({
      tabId: tab.id,
      text: tabTime,
    });

    chrome.browserAction.setBadgeBackgroundColor({
      color: 'purple',
    });
  }

  /**
   * Receives and processes messages sent by chrome extension API e.g. other files.
   *
   * @param  {object} request
   * @param  {object} sender
   * @param  {Function} sendResponse
   * @return {boolean}
   */
  onMessageCallback(request, sender, sendResponse) {
    debugLog('New message:', '\nDetails:', request, '\nFrom:', sender);

    switch (request.action) {
      case 'saveFaviconColorAfterSave':
        setTimeout(() => {
          this.dataManagement.data[request.hostname][request.key] = request.value;
        }, INTERVAL_UPDATE_S);
        return true;

      // first save custom property, then go to case 'save'
      case 'saveFaviconColor':
        this.dataManagement.data[request.hostname][request.key] = request.value;

      // eslint-disable-next-line no-fallthrough
      case 'save':
        this.dataManagement.saveInStorage(sendResponse);
        return true;

      default:
        throw new Error(`Message: ${request.action} not found`, request);
    }
  }

  static onInstalledCallback() {
    debugLog('onInstalled event');
  }

  static onUpdatedCallback(currVersion) {
    debugLog('onUpdated event. Current version:', currVersion);
  }

  onEnableExtension() {
    chrome.browserAction.setIcon({
      path: chrome.runtime.getURL('/assets/icon16.png'),
    });
    this.executeIntervals();
  }

  onDisableExtension() {
    chrome.browserAction.setIcon({
      path: chrome.runtime.getURL('/assets/icon16Disabled.png'),
    });

    // Disable badge in current active tab
    chrome.windows.getLastFocused(
      {
        populate: true,
      },
      (window) => {
        const tab = getActiveTab(window.tabs);

        chrome.browserAction.setBadgeText({
          tabId: tab.id,
          text: '',
        });
      }
    );

    // Disable badge in tabs activated in future
    chrome.tabs.onActivated.addListener((activeInfo) => {
      // @TODO isEnabled from settings
      if (true) {
        chrome.browserAction.setBadgeText({
          tabId: activeInfo.id,
          text: '',
        });
      }
    });

    clearInterval(this.updateDataInterval);
    clearInterval(this.updateStorageInterval);
  }

  /**
   * @param {object} settingsChanges
   */
  onChangedSettingsInBackground(settingsChanges) {
    const oldValue = settingsChanges.oldValue.IS_ENABLED;
    const newValue = settingsChanges.newValue.IS_ENABLED;
    const areDifferente = oldValue !== newValue;

    if (areDifferente) {
      switch (newValue) {
        case true:
          this.onEnableExtension();
          break;
        case false:
          this.onDisableExtension();
          break;
        default:
          this.onEnableExtension();
      }
    }
  }

  /**
   * Execute all extension listeners.
   */
  executeListeners() {
    /**
     * Save data to storage if someone close browser window.
     */
    chrome.windows.onRemoved.addListener(() => {
      this.dataManagement.saveInStorage();
    });

    /**
     * Listens whether the current state of the user has changed.
     */
    chrome.idle.onStateChanged.addListener((state) => {
      this.currentState = state;
      debugLog('onStateChanged:', this.currentState);
    });

    /**
     * Listens to all messages sent from chrome extension API
     * eg from ../popup/popup.html.
     */
    chrome.runtime.onMessage.addListener(this.onMessageCallback.bind(this));

    /**
     * Check whether new version is installed or extension was updated.
     */
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.onInstalledCallback();
      } else if (details.reason === 'update') {
        const currVersion = chrome.runtime.getManifest().version;

        this.onUpdatedCallback(currVersion);
      }
    });

    settings.setOnChangedListener(this.onChangedSettingsInBackground, this);
  }

  updateDataCallback() {
    chrome.windows.getLastFocused(
      {
        populate: true,
      },
      (window) => {
        const tab = getActiveTab(window.tabs);
        const hostname = getFromUrl('hostname', tab.url);

        if (
          tab &&
          isWindowActive(window) &&
          !this.constructor.isURLOnBlacklist(tab.url) &&
          (this.constructor.isStateActive(this.currentState) || isSoundFromTab(tab))
        ) {
          const details = this.dataManagement.updateDataFor(hostname, tab);

          debugLog(
            'Active tab:',
            hostname,
            '\nToday in seconds:',
            details.todayInSec,
            '\nAll time in seconds:',
            details.allTimeInSec,
            '\nTab:',
            tab,
            'Window:',
            window
          );

          // @TODO shouldDisplayBadge from settings
          if (true) {
            this.updateBadge(tab, hostname);
          }
        }
      }
    );
  }

  updateStorageCallback() {
    this.dataManagement.saveInStorage(null);
  }

  /**
   * Execute all extension intervals.
   */
  executeIntervals() {
    this.updateDataInterval = setInterval(this.updateDataCallback.bind(this), INTERVAL_UPDATE_S);
    this.updateStorageInterval = setInterval(
      this.updateStorageCallback.bind(this),
      INTERVAL_UPDATE_MIN
    );
  }

  // eslint-disable-next-line class-methods-use-this
  onFirstStartup() {
    if (!localStorage.getItem(FIRST_STARTUP_KEY)) {
      localStorage.setItem(FIRST_STARTUP_KEY, true);
      settings.save();
    }
  }

  /**
   * Initialize Background.
   *
   * @return {undefined}
   */
  async init() {
    await settings.init();

    // There is also onInstalled event, but it doesnt work in development mode
    this.onFirstStartup();

    if (!settings.IS_ENABLED) {
      return;
    }

    this.executeListeners();
    this.executeIntervals();
  }
}
const background = new Background();
window.background = background;

background.init();
