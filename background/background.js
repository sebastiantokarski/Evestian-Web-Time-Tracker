/* jshint esversion: 6 */
/* global chrome, DEVELOPMENT_MODE, EXTENSION_DATA, DISPLAY_BADGE,
COUNT_ONLY_ACTIVE_STATE, INTERVAL_UPDATE_S, INTERVAL_UPDATE_MIN,
BLACKLIST_PROTOCOL*/

(function () {

    // It can be active, idle or locked
    let currentState = chrome.idle.IdleState.ACTIVE;

    let data = {};

    /**
     * Get some properties from url such as protocol, pathname etc.
     * @param {string} property
     * @param {string} url
     * @returns {string}
     */
    function getFromUrl(property, url) {
        let a = document.createElement('a');
        a.href = url;
        return a[property];
    }

    /**
     * Get active and focused tab
     * @param {Object[]} tabs
     * @returns {Object|boolean} tab object or false
     */
    function getActiveTab(tabs) {
        let i = 0;
        while (i < tabs.length && !tabs[i].active) {
            i++;
        }

        if (tabs[i]) {
            return tabs[i];
        }
        return false;
    }

    /**
     * Get date with format yyyy-mm-dd
     * @returns {string}
     */
    function getDateString() {
        const date = new Date(),
            year = date.getFullYear(),
            month = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getUTCDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    /**
     * Get current quarter
     * @returns {string}
     */
    function getQuarterString() {
        return Math.floor((new Date().getMonth() + 3) / 3).toString();
    }

    /**
     * Get current month
     * @returns {string}
     */
    function getMonthString() {
        return (new Date().getMonth() + 1).toString();
    }

    /**
     * Get current day of the week
     */
    function getDayOfTheWeekString() {
        let dayOfTheWeek = new Date().getDay();
        // Sunday should be 7th day of the week
        if (dayOfTheWeek === 0) {
            dayOfTheWeek = 7;
        }
        return dayOfTheWeek;
    }

    /**
     * Get current time with format hh:mm
     * @returns {string}
     */
    function getTimeString() {
        const date = new Date(),
            hour = ('0' + date.getHours()).slice(-2),
            minute = ('0' + date.getMinutes()).slice(-2);
        return `${hour}:${minute}`;
    }

    /**
     * Check if chrome window is active and focused
     * @returns {boolean}
     */
    function isWindowActive(window) {
        return window && window.focused;
    }

    /**
     * Is there any sound from the tab (video, player, music)
     * @param {Object} tab
     * @returns {boolean}
     */
    function isSoundFromTab(tab) {
        return tab && tab.audible;
    }

    /**
     * Is current state active
     * @param {string} [state=currentState] active, idle or locked
     * @returns {boolean}
     */
    function isStateActive(state = currentState) {
        if (COUNT_ONLY_ACTIVE_STATE) {
            return chrome.idle.IdleState.ACTIVE === state;
        }
        return true;
    }

    /**
     * Check if protocol from url is blacklisted
     * @param {string} url
     * @returns {boolean}
     */
    function isProtocolOnBlacklist(url) {
        return BLACKLIST_PROTOCOL.indexOf(getFromUrl('protocol', url)) !== -1;
    }

    /**
     * Log to console if it is development mode
     * @param {*}
     * @return {undefined}
     */
    function debugLog() {
        if (DEVELOPMENT_MODE) {
            let fnArguments = [].slice.call(arguments);
            if (typeof fnArguments[0] === 'string') {
                fnArguments[0] = '%c' + fnArguments[0];
                fnArguments.splice(1, 0, 'color: #1E90FF');
            }
            console.log.apply(console, [].slice.call(fnArguments));
        }
    }

    /**
     * Add 1 to current number in a given property
     * @param {Object} obj
     * @param {string} property
     * @returns {Object} obj
     */
    function increment(obj, property) {
        if (!obj[property]) {
            obj[property] = 0;
        }
        obj[property] += 1;
        return obj[property];
    }

    /**
     * Update extension storage with data
     * @param {Object} tab
     * @param {string} hostname
     * @returns {undefined}
     */
    function updateStorage(tab, hostname) {

        if (!data[hostname]) {
            data[hostname] = {
                alltime: 0,
                quarters: {
                    [getQuarterString()]: 0
                },
                months: {
                    [getMonthString()]: 0
                },
                daysOfTheWeek: {
                    [getDayOfTheWeekString()]: 0
                },
                days: {
                    [getDateString()]: 0
                },
                times: {
                    [getTimeString()]: 0
                },
                // Tab may not have favicon
                favicon: null
            };
        }

        data[hostname].alltime++;

        increment(data, 'alltime');

        increment(data[hostname].quarters, getQuarterString());
        increment(data[hostname].months, getMonthString());
        increment(data[hostname].daysOfTheWeek, getDayOfTheWeekString());
        increment(data[hostname].days, getDateString());
        increment(data[hostname].times, getTimeString());

        data[hostname].favicon = tab.favIconUrl;
    }

    /**
     * Update badge on the extension icon
     * @param {Object} tab
     * @param {string} hostname
     */
    function updateBadge(tab, hostname) {
        let tabTime = 0;

        let timeInSeconds = data[hostname].days[getDateString()];
        if (timeInSeconds < 60) {
            tabTime = timeInSeconds + 's';
        } else if (timeInSeconds < 60 * 60) {
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
            debugLog('Data saved in storage', data);
        });
    }

    /**
     * Load extension data from local storage chrome API
     */
    function loadDataFromStorage() {
        chrome.storage.local.get(null, (storage) => {
            if (storage[EXTENSION_DATA]) {
                data = JSON.parse(storage[EXTENSION_DATA]);
            } else {
                data = {};
            }
            debugLog('Data loaded:', data);
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

        debugLog('New message:',
            '\nDetails:', request,
            '\nFrom:', sender);

        switch (request.event) {
            case 'openPopup':
                updateAllStorageData();
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
            chrome.storage.local.set({data: JSON.stringify(data)}, function () {
                debugLog('Data saved in storage', data);
            });
        });

        /**
         * Listens whether the current state of the user has changed
         */
        chrome.idle.onStateChanged.addListener(function (state) {
            currentState = state;
            debugLog('onStateChanged:', currentState);
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
                const tab = getActiveTab(window.tabs);
                const hostname = getFromUrl('hostname', tab.url);

                if (tab && isWindowActive(window) && !isProtocolOnBlacklist(tab.url) && (isStateActive() || isSoundFromTab(tab))) {
                    debugLog('Active tab:', hostname, window, tab);

                    updateStorage(tab, hostname);

                    if (DISPLAY_BADGE) {
                        updateBadge(tab, hostname);
                    }
                }
            });
        }, INTERVAL_UPDATE_S);

        let updateStorageInterval = setInterval(updateAllStorageData, INTERVAL_UPDATE_MIN);
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

}());


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