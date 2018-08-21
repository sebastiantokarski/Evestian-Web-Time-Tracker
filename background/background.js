/* jshint esversion: 6 */
/* global chrome */

(function () {

    if (DEVELOPMENT_MODE) {
        window.data = {};
    } else {
        var data = {};
    }

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

                if (tab && isWindowActive(window) && !isProtocolOnBlacklist(tab.url)) {
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
                dayOfTheWeek: {
                    [getDayOfTheWeek()]: 0
                },
                // Tab may not have favicon
                favicon: null
            };
        }

        data[hostname].alltime++;
        data[hostname].days[getDateString()]++;
        if (!data[hostname].dayOfTheWeek) {
            data[hostname].dayOfTheWeek = {
                [getDayOfTheWeek()]: 0
            };
        }
        data[hostname].dayOfTheWeek[getDayOfTheWeek()]++;
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
     * Get date with format year-month-day
     * @returns {string}
     */
    function getDateString() {
        const date = new Date(),
            year = date.getFullYear(),
            month = ('0' + (new Date().getMonth() + 1)).slice(-2),
            day = new Date().getUTCDate();
        return `${year}-${month}-${day}`;
    }

    /**
     * Returns current day of the week
     * @returns {string}
     */
    function getDayOfTheWeek() {
        return new Date().getDay().toString();
    }

    /**
     * Check if chrome window is active and focused
     * @returns {boolean}
     */
    function isWindowActive(window) {
        return window && window.focused;
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