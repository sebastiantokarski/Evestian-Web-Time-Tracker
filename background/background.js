/* jshint esversion: 6 */
/* global chrome, requirejs */

requirejs(['../js/config.js', '../js/utils.js'], function(config, utils) {

    // It can be active, idle or locked
    let currentState = chrome.idle.IdleState.ACTIVE;

    let data = {};

    /**
     * Update extension storage with data
     * @param {Object} tab
     * @param {string} hostname
     * @returns {undefined}
     */
    function updateStorage(tab, hostname) {

        const
            currentYear = utils.getCurrentYear(),
            currentQuarter = utils.getCurrentQuarter(),
            currentMonth = utils.getCurrentMonth(),
            currentDayOfTheWeek = utils.getCurrentDayOfTheWeek(),
            currentDayOfTheMonth = utils.getCurrentDayOfTheMonth(),
            currentTime = utils.getCurrentTime();

        const
            dayOfTheMonthObj = {
                [config.ALL_TIME]: 0,
                [currentTime]: 0
            },
            dayOfTheWeekObj = {
                [currentDayOfTheWeek]: 0
            },
            monthObj = {
                [config.ALL_TIME]: 0,
                [config.DAY_OF_THE_WEEK]: dayOfTheWeekObj,
                [currentDayOfTheMonth]: dayOfTheMonthObj
            },
            quarterObj = {
                [config.ALL_TIME]: 0,
                [currentMonth]: monthObj
            },
            yearObj = {
                [config.ALL_TIME]: 0,
                [currentQuarter]: quarterObj
        };

        if (!data[hostname]) {
            data[hostname] = {
                [currentYear]: yearObj
            };
            data[hostname].favicon = null;
        }

        utils.increment(data, config.ALL_TIME);

        if (!data.getYear(hostname, currentYear)) {
            data[hostname][currentYear] = yearObj;
        } else if (!data.getQuarter(hostname, currentQuarter)) {
            data[hostname][currentYear] = quarterObj;
        } else if (!data.getMonth(hostname, currentMonth)) {
            data[hostname][currentYear][currentQuarter][currentMonth] = monthObj;
        } else if (!data.getDayOfTheMonth(hostname, currentDayOfTheMonth)) {
            data[hostname][currentYear][currentQuarter][currentMonth][currentDayOfTheMonth] = dayOfTheMonthObj;
        } else if (!data.getDayOfTheWeek(hostname, currentDayOfTheWeek)) {
            data[hostname][currentYear][currentQuarter][currentMonth][config.DAY_OF_THE_WEEK] = dayOfTheWeekObj;
        }

        utils.increment(data.getYear(hostname, currentYear), config.ALL_TIME);
        utils.increment(data.getQuarter(hostname, currentQuarter), config.ALL_TIME);
        utils.increment(data.getMonth(hostname, currentMonth), config.ALL_TIME);
        utils.increment(data.getDayOfTheMonth(hostname, currentDayOfTheMonth), config.ALL_TIME);
        utils.increment(data.getDayOfTheWeek(hostname, currentDayOfTheWeek), currentDayOfTheWeek);
        utils.increment(data.getDayOfTheMonth(hostname, currentDayOfTheMonth), currentTime);

        data[hostname].favicon = tab.favIconUrl;
    }

    /**
     * Update badge on the extension icon
     * @param {Object} tab
     * @param {string} hostname
     */
    function updateBadge(tab, hostname) {
        let tabTime = 0;

        let timeInSeconds = data.getDayOfTheMonth(hostname)[config.ALL_TIME];
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
     * Updates all data in chrome storage local API by overwriting
     */
    function updateAllStorageData() {
        chrome.storage.local.set({data: JSON.stringify(data)}, () => {
            utils.debugLog('Data saved in storage', data);
        });
    }

    /**
     * Load extension data from local storage chrome API
     */
    function loadDataFromStorage() {
        chrome.storage.local.get(null, (storage) => {
            if (storage[config.EXTENSION_DATA]) {
                data = JSON.parse(storage[config.EXTENSION_DATA]);
            } else {
                data = {};
            }
            utils.prepareDataObjectMethods(data);
            utils.debugLog('Data loaded:', data);
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
                updateAllStorageData();
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
            chrome.storage.local.set({data: JSON.stringify(data)}, () => {
                utils.debugLog('Data saved in storage', data);
            });
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

                    updateStorage(tab, hostname);

                    if (config.DISPLAY_BADGE) {
                        updateBadge(tab, hostname);
                    }
                }
            });
        }, config.INTERVAL_UPDATE_S);

        let updateStorageInterval = setInterval(updateAllStorageData, config.INTERVAL_UPDATE_MIN);
    }

    /**
     * Initialize all tasks, listeners, intervals etc.
     */
    function init() {
        loadDataFromStorage();

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