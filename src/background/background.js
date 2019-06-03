/* global chrome */
import '@babel/polyfill';
import config from '../js/config';
import utils from '../js/utils';
import Data from '../js/Data';
import HotReload from './hot-reload';

class Background {
    constructor() {
        this.currentState = chrome.idle.IdleState.ACTIVE;

        if (config.DEVELOPMENT_MODE) {
            new HotReload();
        }

        let data = new Data(config.EXTENSION_DATA_NAME);
        data.loadFromStorage();
    }


    /**
     * Update badge on the extension icon
     * @param {Object} tab
     * @param {string} hostname
     */
    updateBadge(tab, hostname) {
        let tabTime = 0;

        let timeInSeconds = data.getDayOfTheMonthData(hostname)[config.ALL_TIME];
        if (timeInSeconds < 60) {
            tabTime = timeInSeconds + 's';
        } else if (timeInSeconds < 60 * 100) {
            tabTime = Math.floor(timeInSeconds / 60) + 'm';
        } else {
            tabTime = Math.floor(timeInSeconds / 60 / 60) + 'h';
        }

        chrome.browserAction.setBadgeText({
            tabId: tab.id,
            text: tabTime
        });

        chrome.browserAction.setBadgeBackgroundColor({
            color: 'purple'
        });
    }

    /**
     * Receives and processes messages sent by chrome extension API e.g. other files
     * @param {Object} request
     * @param {Object} sender
     * @param {function} sendResponse
     * @returns {boolean}
     */
    onMessageCallback (request, sender, sendResponse) {

        utils.debugLog('New message:',
            '\nDetails:', request,
            '\nFrom:', sender);

        switch (request.event) {
            case 'openPopup':
                data.saveInStorage();
                sendResponse(true);
                return true;

            default:
                throw(`Message: ${request.event} not found`);

        }
    }

    /**
     * Execute all extension listeners
     */
    executeListeners() {
        /**
         * Save data to storage if someone close browser window
         */
        chrome.windows.onRemoved.addListener(() => {
            data.saveInStorage();
        });

        /**
         * Listens whether the current state of the user has changed
         */
        chrome.idle.onStateChanged.addListener((state) => {
            this.currentState = state;
            utils.debugLog('onStateChanged:', this.currentState);
        });


        /**
         * Listens to all messages sent from chrome extension API e.g. from ../popup/popup.html
         */
        chrome.runtime.onMessage.addListener(this.onMessageCallback);
    }

    /**
     * Execute all extension intervals
     */
    executeIntervals() {
        let updateDataInterval = setInterval(() => {
            chrome.windows.getLastFocused({
                populate: true
            }, (window) => {
                const tab = utils.getActiveTab(window.tabs);
                const hostname = utils.getFromUrl('hostname', tab.url);

                if (tab && utils.isWindowActive(window) && !utils.isProtocolOnBlacklist(tab.url)
                    && (utils.isStateActive(this.currentState) || utils.isSoundFromTab(tab))) {

                    const details = data.updateDataFor(hostname, tab);

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

        let updateStorageInterval = setInterval(function () {
            data.saveInStorage();
        }, config.INTERVAL_UPDATE_MIN);
    }

    init() {

        this.executeListeners();

        this.executeIntervals();
    }
}

const background = new Background();
background.init();


// /* Auxilliary functions */

// function g() {
//     chrome.storage.local.get(null, function (e) {
//         console.log(e);
//     });
// }

// function c() {
//     chrome.storage.local.clear();
// }

// function size() {
//     chrome.storage.local.getBytesInUse(null, function (e) {
//         console.log(e);
//     });
// }