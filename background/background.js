/* global chrome, requirejs */

requirejs(['../js/config.js', '../js/utils.js', '../js/class/Data.js'], function(config, utils, Data) {

    // It can be active, idle or locked
    let currentState = chrome.idle.IdleState.ACTIVE;

    let data = new Data(config.EXTENSION_DATA_NAME);

    /**
     * Update badge on the extension icon
     * @param {Object} tab
     * @param {string} hostname
     */
    function updateBadge(tab, hostname) {
        let tabTime = 0;

        let timeInSeconds = data.getDayOfTheMonthFor(hostname)[config.ALL_TIME];
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
    function onMessageCallback (request, sender, sendResponse) {

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
    function executeListeners() {
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
            currentState = state;
            utils.debugLog('onStateChanged:', currentState);
        });


        /**
         * Listens to all messages sent from chrome extension API e.g. from ../popup/popup.html
         */
        chrome.runtime.onMessage.addListener(onMessageCallback);
    }

    /**
     * Execute all extension intervals
     */
    function executeIntervals() {
        let updateDataInterval = setInterval(() => {
            chrome.windows.getLastFocused({
                populate: true
            }, (window) => {
                const tab = utils.getActiveTab(window.tabs);
                const hostname = utils.getFromUrl('hostname', tab.url);

                if (tab && utils.isWindowActive(window) && !utils.isProtocolOnBlacklist(tab.url)
                    && (utils.isStateActive(currentState) || utils.isSoundFromTab(tab))) {
                    utils.debugLog('Active tab:', hostname, window, tab);

                    data.updateDataFor(hostname, tab);

                    if (config.DISPLAY_BADGE) {
                        updateBadge(tab, hostname);
                    }
                }
            });
        }, config.INTERVAL_UPDATE_S);

        let updateStorageInterval = setInterval(function () {
            data.saveInStorage();
        }, config.INTERVAL_UPDATE_MIN);
    }

    /**
     * Initialize all tasks, listeners, intervals etc.
     */
    function init() {

        executeListeners();

        executeIntervals();
    }

    init();

});


/* Auxilliary functions */

function g() {
    chrome.storage.local.get(null, function (e) {
        console.log(e);
    });
}

function c() {
    chrome.storage.local.clear();
}

function size() {
    chrome.storage.local.getBytesInUse(null, function (e) {
        console.log(e);
    });
}