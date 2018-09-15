/* global chrome, define, module */
// @todo LACK OF GLOBAL TIME COUNTING (max is year)
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../config.js', '../../node_modules/then-chrome/dist/then-chrome.js', '../utils.js'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Data = factory();
    }
}(this, (config, thenChrome, utils) => {

    /**
     * Class that stores and updates data
     */
    return class Data {

        /**
         * Creating new data based on the data in chrome storage API. If not exist, creates empty object
         * @param {string} dataName
         */
        constructor(dataName) {
            this.dataName = dataName;
            this.loadFromStorage();
        }

        /**
         * Updates data in chrome storage local API by overwriting
         */
        saveInStorage(data = this.data) {
            chrome.storage.local.set({ [this.dataName]: data }, () => {
                utils.debugLog(`Successfully saved in storage - ${this.dataName}:`, data);
            })
        }

        /**
         * Load extension data from chrome storage API
         */
        loadFromStorage() {
            thenChrome.storage.local.get(this.dataName)
                .then((data) => {
                    if (data[this.dataName]) {
                        this.data = data[this.dataName];
                        utils.debugLog(`Loaded from storage - ${this.dataName}:`, this.data);
                    } else {
                        this.data = {};
                        utils.debugLog(`Item not found in storage - ${this.dataName}`, this.data);
                    }
                })
        }

        /**
         * Gets year data object for a given domain
         * @param {string} hostname
         * @param {string} [year = utils.getCurrentYear()]
         * @returns {Object}
         */
        getYearFor(hostname, year = utils.getCurrentYear()) {
            return this.data[hostname][year];
        }

        /**
         * Gets quarter data object for a given domain
         * @param {string} hostname
         * @param {string} [quarter = utils.getCurrentQuarter()]
         * @returns {Object}
         */
        getQuarterFor(hostname, quarter = utils.getCurrentQuarter()) {
            try {
                return this.getYearFor(hostname)[quarter];
            } catch (ex) {
                utils.debugLog(`Error in getQuarter: ${hostname}, ${quarter}`);
                return false;
            }
        }

        /**
         * Gets month data object for a given domain
         * @param {string} hostname
         * @param {string} [month = utils.getCurrentMonth()]
         * @returns {Object}
         */
        getMonthFor(hostname, month = utils.getCurrentMonth()) {
            return this.getQuarterFor(hostname)[month];
        }

        /**
         * Gets day of the month data object for a given domain
         * @param {string} hostname
         * @param {string} [dayOfTheMonth = utils.getCurrentDayOfTheMonth()]
         * @returns {Object}
         */
        getDayOfTheMonthFor(hostname, dayOfTheMonth = utils.getCurrentDayOfTheMonth()) {
            return this.getMonthFor(hostname)[dayOfTheMonth];
        }

        /**
         * Gets day of the week data object for a given domain
         * @param {string} hostname
         * @param {string} [dayOfTheWeek = utils.getCurrentDayOfTheWeek()]
         * @returns {Object}
         */
        getDayOfTheWeekFor(hostname, dayOfTheWeek = utils.getCurrentDayOfTheWeek()) {
            return this.getMonthFor(hostname)[config.DAY_OF_THE_WEEK][dayOfTheWeek];
        }

        /**
         * Gets today data object for a given domain
         * @param {string} hostname
         * @returns {Object}
         */
        getTodayFor(hostname) {
            return this.getDayOfTheMonthFor(hostname);
        }

        /**
         * Gets yesterday data object for a given domain
         * @param {string} hostname
         * @returns {Object}
         */
        getYesterdayFor(hostname) {
            return this.getDayOfTheMonthFor(hostname, utils.getYesterdayDay());
        }

        /**
         * Creates initial data object for given domain
         * @param {string} hostname
         * @param {Object} dataObj
         */
        createEmptyDataObject(hostname, dataObj) {

            this.data[hostname] = {
                [dataObj.currentYear]: dataObj.yearObj
            };
            this.data[hostname].favicon = null;
            this.data[hostname].firstVisit = utils.getDateString();
        }

        /**
         * Checks if given hostname is already stored in data
         * @param {string} hostname
         * @returns {boolean}
         */
        isPageAlreadyInData(hostname) {
            return !!this.data[hostname];
        }

        /**
         * Returns a data storage template for one domain
         * @returns {{
         * currentYear: (string),
         * currentQuarter: (string),
         * currentMonth: (string),
         * currentDayOfTheWeek: (string),
         * currentDayOfTheMonth: (string),
         * currentTime: (string),
         * dayOfTheMonthObj: (object),
         * dayOfTheWeekObj: (object),
         * monthObj: (object),
         * quarterObj: (object),
         * yearObj: (object)
         * }}
         */
        getDataObjectTemplate() {

            let dataObj = {
                currentYear: utils.getCurrentYear(),
                currentQuarter: utils.getCurrentQuarter(),
                currentMonth: utils.getCurrentMonth(),
                currentDayOfTheWeek: utils.getCurrentDayOfTheWeek(),
                currentDayOfTheMonth: utils.getCurrentDayOfTheMonth(),
                currentTime: utils.getCurrentTime()
            };
            dataObj.dayOfTheMonthObj = {
                [config.ALL_TIME]: 0,
                    [dataObj.currentTime]: 0
            };
            dataObj.dayOfTheWeekObj = {
                [dataObj.currentDayOfTheWeek]: 0
            };
            dataObj.monthObj = {
                [config.ALL_TIME]: 0,
                [config.DAY_OF_THE_WEEK]: dataObj.dayOfTheWeekObj,
                [dataObj.currentDayOfTheMonth]: dataObj.dayOfTheMonthObj
            };
            dataObj.quarterObj = {
                [config.ALL_TIME]: 0,
                [dataObj.currentMonth]: dataObj.monthObj
            };
            dataObj.yearObj = {
                [config.ALL_TIME]: 0,
                [dataObj.currentQuarter]: dataObj.quarterObj
            };

            return dataObj
        };

        /**
         * Update extension storage with data
         * @param {Object} tab
         * @param {string} hostname
         * @returns {undefined}
         */
        updateDataFor(hostname, tab) {

            const dataObj = this.getDataObjectTemplate();

            if (!this.isPageAlreadyInData(hostname)) {
                this.createEmptyDataObject(hostname, dataObj);
            }

            if (!this.getYearFor(hostname, dataObj.currentYear)) {
                this.data[hostname][dataObj.currentYear] =  dataObj.yearObj;
            } else if (!this.getQuarterFor(hostname,  dataObj.currentQuarter)) {
                this.data[hostname][dataObj.currentYear] =  dataObj.quarterObj;
            } else if (!this.getMonthFor(hostname,  dataObj.currentMonth)) {
                this.data[hostname][dataObj.currentYear][dataObj.currentQuarter][dataObj.currentMonth] =  dataObj.monthObj;
            } else if (!this.getDayOfTheMonthFor(hostname,  dataObj.currentDayOfTheMonth)) {
                this.data[hostname][dataObj.currentYear][dataObj.currentQuarter][dataObj.currentMonth][dataObj.currentDayOfTheMonth] =  dataObj.dayOfTheMonthObj;
            } else if (!this.getDayOfTheWeekFor(hostname,  dataObj.currentDayOfTheWeek)) {
                this.data[hostname][dataObj.currentYear][dataObj.currentQuarter][dataObj.currentMonth][config.DAY_OF_THE_WEEK] =  dataObj.dayOfTheWeekObj;
            }

            utils.increment(this.getYearFor(hostname, dataObj.currentYear), config.ALL_TIME);
            utils.increment(this.getQuarterFor(hostname, dataObj.currentQuarter), config.ALL_TIME);
            utils.increment(this.getMonthFor(hostname, dataObj.currentMonth), config.ALL_TIME);
            utils.increment(this.getDayOfTheMonthFor(hostname, dataObj.currentDayOfTheMonth), config.ALL_TIME);
            utils.increment(this.getMonthFor(hostname, dataObj.currentMonth)[config.DAY_OF_THE_WEEK], dataObj.currentDayOfTheWeek);
            utils.increment(this.getDayOfTheMonthFor(hostname, dataObj.currentDayOfTheMonth), dataObj.currentTime);

            this.data[hostname].favicon = tab.favIconUrl;
            this.data[hostname].lastVisit = utils.getDateString();
        }
    }

}));