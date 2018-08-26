/* jshint esversion: 6 */
/* global chrome */

// @todo only in dev mode it can be global
let data = {};

(function () {

    // It can be active, idle or locked
    let currentState = chrome.idle.IdleState.ACTIVE;

    loadStorage();

    executeListeners();

    executeIntervals();

    /**
     * Load extension data from local storage chrome API
     */
    function loadStorage() {
        chrome.storage.local.get(null, storage => {
            if (storage[EXTENSION_DATA]) {
                data = JSON.parse(storage[EXTENSION_DATA]);
            } else {
                data = {};
            }
            debugLog('Data loaded:', data);
        });
    }

    /**
     * Execute all extension listeners
     */
    function executeListeners() {
        /**
         * Save data to storage if someone close browser window
         */
        chrome.windows.onRemoved.addListener(()=> {
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

                if (tab && isWindowActive(window) && isStateActive() && !isProtocolOnBlacklist(tab.url)) {
                    debugLog('Active tab:', hostname, window, tab);

                    updateStorage(tab, hostname);

                    if (DISPLAY_BADGE) {
                        updateBadge(tab, hostname);
                    }
                }
            });
        }, INTERVAL_UPDATE_S);

        let updateStorageInterval = setInterval(() => {
            chrome.storage.local.set({data: JSON.stringify(data)}, () => {
                debugLog('Data saved in storage', data);
            });
        }, INTERVAL_UPDATE_MIN);
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
                days: {
                    [getDateString()]: 0
                },
                time: {
                    [getTimeString()]: 0
                },
                // Tab may not have favicon
                favicon: null
            };
        }

        data[hostname].alltime++;
        if (!data[hostname].days[getDateString()]) {
            data[hostname].days[getDateString()] = 0;
        }
        if (!data[hostname].time[getTimeString()]) {
            data[hostname].time[getTimeString()] = 0;
        }
        data[hostname].days[getDateString()]++;
        data[hostname].time[getTimeString()]++;
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
     * Get active and focused tab
     * @param {Object[]} tabs
     * @returns {Object|boolean} tab object or false
     */
    function getActiveTab(tabs) {
        let i = 0;
        do {
            i++;
        } while (i < tabs.length && !tabs[i].active);

        if (tabs[i]) {
            return tabs[i];
        }
        return false;
    }

    /**
     * Get date with format year-month-day quarter dayOfTheWeek
     * @returns {string}
     */
    function getDateString() {
        const date = new Date(),
            year = date.getFullYear(),
            month = ('0' + (date.getMonth() + 1)).slice(-2),
            day = date.getUTCDate(),
            quarter = Math.floor((date.getMonth() + 3) / 3),
            dayOfTheWeek = date.getDay();
        return `${year}-${month}-${day} ${quarter}q ${dayOfTheWeek}d`;
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
     * Is current state active
     * @param {string} state active, idle or locked
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