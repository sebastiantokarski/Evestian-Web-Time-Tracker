/* global chrome, define, module */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            '../config.js',
            '../../node_modules/then-chrome/dist/then-chrome.js',
            '../utils.js'
        ], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('../config.js'),
            require('../../node_modules/then-chrome/dist/then-chrome.js'),
            require('../utils.js')
        );
    } else {
        root.Data = factory(
            root.config,
            root.thenChrome,
            root.utils
        );
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
        }

        get dataName() {
            return this._dataName;
        }

        set dataName(value) {
            if (!value || typeof value !== 'string') {
                throw('dataName is required');
            }
            this._dataName = value;
        }

        /**
         * Updates data in chrome storage local API by overwriting
         */
        saveInStorage(data = this.data) {
            chrome.storage.local.set({[this.dataName]: data}, () => {
                utils.debugLog(`Successfully saved in storage - ${this.dataName}:`, data);
                this.checkDataSize();
            });
        }

        /**
         * Check how many bytes in currently used in storage
         */
        checkDataSize() {
            chrome.storage.local.getBytesInUse(this.dataName, function (size) {
                const totalSize = chrome.storage.local.QUOTA_BYTES;
                utils.debugLog(`Used storage size in bytes: ${size}. Percentage: ${ (size / totalSize).toFixed(3) }%`);
            });
        }

        /**
         * Load extension data from chrome storage API
         * If data does not exist, they are created
         */
        loadFromStorage() {
            let self = this;
            return new Promise((resolve) => {
                thenChrome.storage.local.get(self.dataName)
                    .then((data) => {
                        if (data[self.dataName]) {
                            self.data = data[self.dataName];
                            utils.debugLog(`Loaded from storage - ${self.dataName}:`, self.data);
                        } else {
                            self.createEmptyDataObject();
                            utils.debugLog(`Item not found in storage - ${self.dataName}`, self.data);
                        }
                        if (config.DEVELOPMENT_MODE) {
                            window.data = self.data;
                        }
                        resolve(self.data);
                    });
            });
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
         * Gets week details (week of the year and day of the week) data object for a given domain
         * @param {string} hostname
         * @param {string} [weekDetails = utils.getCurrentWeekDetails()]
         * @returns {Object}
         */
        getWeekDetailsFor(hostname, weekDetails = utils.getCurrentWeekDetails()) {
            return this.getYearFor(hostname)[config.WEEK_DETAILS][weekDetails];
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
         * Creates initial data object
         */
        createEmptyDataObject() {
            this.data = {};
            this.data[config.ALL_TIME] = 0;
            this.data[config.FIRST_VISIT] = utils.getDateString();
        }

        /**
         * Creates initial data object for given domain
         * @param {string} hostname
         * @param {Object} dataObj
         */
        createEmptyHostnameDataObject(hostname, dataObj) {

            this.data[hostname] = {
                [dataObj.currentYear]: dataObj.yearObj,
                [config.ALL_TIME]: 0
            };
            this.data[hostname].favicon = null;
            this.data[hostname][config.FIRST_VISIT] = utils.getDateString();
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
         * weekDetailsObj: (object),
         * monthObj: (object),
         * quarterObj: (object),
         * yearObj: (object)
         * }}
         */
        getDataObjectTemplate() {

            let dataObj = {
                currentYear: utils.getCurrentYear(),
                currentWeekOfTheYear: utils.getCurrentWeekOfTheYear(),
                currentQuarter: utils.getCurrentQuarter(),
                currentMonth: utils.getCurrentMonth(),
                currentWeekDetails: utils.getCurrentWeekDetails(),
                currentDayOfTheMonth: utils.getCurrentDayOfTheMonth(),
                currentTime: utils.getCurrentTime()
            };
            dataObj.dayOfTheMonthObj = {
                [config.ALL_TIME]: 0,
                [dataObj.currentTime]: 0
            };
            dataObj.weekDetailsObj = {
                [dataObj.currentWeekDetails]: 0
            };
            dataObj.monthObj = {
                [config.ALL_TIME]: 0,
                [dataObj.currentDayOfTheMonth]: dataObj.dayOfTheMonthObj
            };
            dataObj.quarterObj = {
                [config.ALL_TIME]: 0,
                [dataObj.currentMonth]: dataObj.monthObj
            };
            dataObj.yearObj = {
                [config.ALL_TIME]: 0,
                [config.WEEK_DETAILS]: dataObj.weekDetailsObj,
                [dataObj.currentQuarter]: dataObj.quarterObj
            };

            return dataObj;
        }

        /**
         * Update extension storage with data
         * @param {Object} tab
         * @param {string} hostname
         * @returns {Object}
         */
        updateDataFor(hostname, tab) {

            const dataObj = this.getDataObjectTemplate();

            if (!this.isPageAlreadyInData(hostname)) {
                this.createEmptyHostnameDataObject(hostname, dataObj);
            }

            if (!this.getYearFor(hostname, dataObj.currentYear)) {
                this.data[hostname][dataObj.currentYear] = dataObj.yearObj;
            } else if (!this.getQuarterFor(hostname, dataObj.currentQuarter)) {
                this.data[hostname][dataObj.currentYear] = dataObj.quarterObj;
            } else if (!this.getMonthFor(hostname, dataObj.currentMonth)) {
                this.data[hostname][dataObj.currentYear][dataObj.currentQuarter][dataObj.currentMonth] = dataObj.monthObj;
            } else if (!this.getDayOfTheMonthFor(hostname, dataObj.currentDayOfTheMonth)) {
                this.data[hostname][dataObj.currentYear][dataObj.currentQuarter][dataObj.currentMonth][dataObj.currentDayOfTheMonth] = dataObj.dayOfTheMonthObj;
            } else if (!this.getWeekDetailsFor(hostname, dataObj.currentWeekDetails)) {
                this.data[hostname][dataObj.currentYear][config.WEEK_DETAILS] = dataObj.weekDetailsObj;
            }

            utils.increment(this.data, config.ALL_TIME);

            utils.increment(this.data[hostname], config.ALL_TIME);

            utils.increment(this.getYearFor(hostname, dataObj.currentYear), config.ALL_TIME);
            utils.increment(this.getQuarterFor(hostname, dataObj.currentQuarter), config.ALL_TIME);
            utils.increment(this.getMonthFor(hostname, dataObj.currentMonth), config.ALL_TIME);
            utils.increment(this.getDayOfTheMonthFor(hostname, dataObj.currentDayOfTheMonth), config.ALL_TIME);
            utils.increment(this.getYearFor(hostname, dataObj.currentYear)[config.WEEK_DETAILS], dataObj.currentWeekDetails);
            utils.increment(this.getDayOfTheMonthFor(hostname, dataObj.currentDayOfTheMonth), dataObj.currentTime);

            this.data[hostname].favicon = tab.favIconUrl;
            this.data[hostname][config.LAST_VISIT] = utils.getDateString();

            return {
                todayInSec: this.getTodayFor(hostname)[config.ALL_TIME],
                allTimeInSec: this.data[hostname][config.ALL_TIME]
            };
        }
    };

}));