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

    switch (request.event) {
      case 'openPopup':
        this.data.saveInStorage();
        sendResponse(true);
        return true;

      case 'save':
        this.data.data[request.hostname][request.key] = request.value;
        this.data.saveInStorage();
        sendResponse(true);
        return true;

      default:
        throw new Error(`Message: ${request.event} not found`);
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
    chrome.runtime.onMessage.addListener(this.onMessageCallback);
  }

  /**
   * Execute all extension intervals.
   */
  executeIntervals() {
    this.updateDataInterval = setInterval(() => {
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
    }, config.INTERVAL_UPDATE_S);

    this.updateStorageInterval = setInterval(() => {
      this.data.saveInStorage();
    }, config.INTERVAL_UPDATE_MIN);
  }

  /**
   * Initialize Background.
   */
  init() {
    this.executeListeners();

    this.executeIntervals();
  }
}

const background = new Background();

background.init();
