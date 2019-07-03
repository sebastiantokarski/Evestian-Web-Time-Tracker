import '@babel/polyfill';
import config from '../js/config';
import utils from '../js/utils';
import Data from '../js/Data';
import HotReload from './hot-reload';

/** Class Background */
class Background {
  /**
   * Constructor.
   */
  constructor() {
    this.currentState = chrome.idle.IdleState.ACTIVE;

    if (config.DEVELOPMENT_MODE) {
      this._hotReload = new HotReload();
    }

    this.data = new Data(config.EXTENSION_DATA_NAME);
    this.data.loadFromStorage();
    window.data = this.data.data;
  }

  /**
   * Update badge on the extension icon.
   *
   * @param {object} tab
   * @param {string} hostname
   */
  updateBadge(tab, hostname) {
    const timeInSeconds = this.data.getDayOfTheMonthData(hostname)[config.ALL_TIME];
    let tabTime = 0;

    if (timeInSeconds < 60) {
      tabTime = timeInSeconds + 's';
    } else if (timeInSeconds < 60 * 100) {
      tabTime = Math.floor(timeInSeconds / 60) + 'm';
    } else {
      tabTime = Math.floor(timeInSeconds / 60 / 60) + 'h';
    }

    chrome.browserAction.setBadgeText({
      tabId: tab.id,
      text: tabTime,
    });

    chrome.browserAction.setBadgeBackgroundColor({
      color: 'purple',
    });
  }

  // eslint-disable-next-line jsdoc/require-description-complete-sentence
  /**
   * Receives and processes messages sent by chrome extension API e.g. other files.
   *
   * @param  {object} request
   * @param  {object} sender
   * @param  {Function} sendResponse
   * @return {boolean}
   */
  onMessageCallback(request, sender, sendResponse) {
    utils.debugLog('New message:',
        '\nDetails:', request,
        '\nFrom:', sender);

    switch (request.action) {
      // first save custom property, then go to case 'save'
      case 'customSave':
        this.data.data[request.hostname][request.key] = request.value;

      case 'save':
        this.data.saveInStorage(sendResponse);
        return true;

      case 'enable':
        config.ENABLED = true;
        chrome.storage.local.set({ enabled: true });
        chrome.browserAction.setIcon({ path: chrome.runtime.getURL('/assets/icon16.png') });
        this.executeIntervals();
        return true;

      case 'disable':
        config.ENABLED = false;
        chrome.storage.local.set({ enabled: false });
        chrome.browserAction.setIcon({ path: chrome.runtime.getURL('/assets/icon16Disabled.png') });
        chrome.browserAction.setBadgeText({ text: '' });
        clearInterval(this.updateDataInterval);
        clearInterval(this.updateStorageInterval);
        return true;

      default:
        throw new Error(`Message: ${request.action} not found`, request);
    }
  }

  /**
   * Execute all extension listeners.
   */
  executeListeners() {
    /**
     * Save data to storage if someone close browser window
     */
    chrome.windows.onRemoved.addListener(() => {
      this.data.saveInStorage();
    });

    /**
     * Listens whether the current state of the user has changed
     */
    chrome.idle.onStateChanged.addListener((state) => {
      this.currentState = state;
      utils.debugLog('onStateChanged:', this.currentState);
    });

    /**
     * Listens to all messages sent from chrome extension API
     * e.g. from ../popup/popup.html.
     */
    chrome.runtime.onMessage.addListener(this.onMessageCallback.bind(this));
  }

  updateDataCallback() {
    chrome.windows.getLastFocused({
      populate: true,
    }, (window) => {
      const tab = utils.getActiveTab(window.tabs);
      const hostname = utils.getFromUrl('hostname', tab.url);

      if (tab && utils.isWindowActive(window) && !utils.isProtocolOnBlacklist(tab.url)
        && (utils.isStateActive(this.currentState) || utils.isSoundFromTab(tab))) {
        const details = this.data.updateDataFor(hostname, tab);

        utils.debugLog('Active tab:', hostname,
            '\nToday in seconds:', details.todayInSec,
            '\nAll time in seconds:', details.allTimeInSec,
            '\nTab:', tab, 'Window:', window);

        if (config.DISPLAY_BADGE) {
          this.updateBadge(tab, hostname);
        }
      }
    });
  }

  updateStorageCallback() {
    this.data.saveInStorage();
  }

  /**
   * Execute all extension intervals.
   */
  executeIntervals() {
    this.updateDataInterval = setInterval(this.updateDataCallback, config.INTERVAL_UPDATE_S);
    this.updateStorageInterval = setInterval(this.updateStorageCallback, config.INTERVAL_UPDATE_MIN);
  }

  /**
   * Initialize Background.
   */
  init() {
    if (!config.ENABLED) {
      return;
    }

    this.executeListeners();
    this.executeIntervals();
  }
}

const background = new Background();

background.init();
