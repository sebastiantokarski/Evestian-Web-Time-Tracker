/* global chrome, define, module */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            './config.js',
            './utils.js',
            './Data.js'
        ], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('./config.js'),
            require('./utils.js'),
            require('./Data.js')
        );
    } else {
        root.DataProcessing = factory(
            root.config,
            root.utils,
            root.Data
        );
    }
}(this, (config, utils, Data) => {

    return class DataProcessing extends Data {

        /**
         * Constructor same as in Data class
         * @param {string} dataName
         */
        constructor(dataName) {
            super(dataName);
        }

        /**
         * Sorts descending tables
         * @param {Array} array
         * @param {number} indexToCompare
         * @returns {*|void}
         */
        static sortDescending(array, indexToCompare) {
            return array.sort(function (a, b) {
                return b[indexToCompare] - a[indexToCompare];
            });
        }

        /**
         * Creates map, where keys are numbers, and value is the same for every key
         * @param {number} numberOfKeys
         * @param {*} value
         * @param {number} [startNumber=0]
         * @returns {Object}
         */
        static createSimpleMap(numberOfKeys, value, startNumber = 0) {
            let newObj = {};

            for (let i = startNumber; i < numberOfKeys + startNumber; i++) {
                newObj[i] = value;
            }

            return newObj;
        }

        /**
         * Converts key to first element, and value to second element of an array
         * Returns Array of arrays
         * @param {Object} obj
         * @returns {Array[]}
         */
        static convertSimpleObjectToArray(obj) {
            let newArray = [];

            for (let key in obj) {
                if (!obj.hasOwnProperty(key)) continue;

                newArray.push([
                    key,
                    obj[key]
                ]);
            }

            return newArray;
        }

        /**
         * Convert 1 to Monday, 2 to Tuesday etc.
         * @param {number} dayNumber
         * @returns {string}
         */
        static convertDayOfTheWeekToName(dayNumber) {
            const daysMap = {
                1: 'Monday',
                2: 'Tuesday',
                3: 'Wednesday',
                4: 'Thursday',
                5: 'Friday',
                6: 'Saturday',
                7: 'Sunday'
            };

            return daysMap[dayNumber];
        }

        /**
         * Parse seconds into time in format 00d00h00m00s
         * @todo if 00m then minutes do not appear
         * @param {number} seconds
         * @returns {string}
         */
        static parseSecondsIntoTime(seconds) {

            const oneDay = 60 * 60 * 24;
            const oneHour = 60 * 60;
            const oneMinute = 60;

            let time = {
                days: '',
                hours: '',
                minutes: '',
                seconds
            };


            if (time.seconds > oneDay) {
                time.days = Math.floor(time.seconds / oneDay);
                time.seconds -= (time.days * oneDay);
                time.days = time.days + 'd';
            }

            if (time.seconds > oneHour) {
                time.hours = Math.floor(time.seconds / oneHour);
                time.seconds -= (time.hours * oneHour);
                time.hours = time.days ? ('0' + time.hours).slice(-2) + 'h' : time.hours + 'h';
            }

            if (time.seconds > oneMinute) {
                time.minutes = Math.floor(time.seconds / oneMinute);
                time.seconds -= (time.minutes * oneMinute);
                time.minutes = time.hours ? ('0' + time.minutes).slice(-2) + 'm' : time.minutes + 'm';
            }

            time.seconds = time.minutes ? ('0' + time.seconds).slice(-2) + 's' : time.seconds + 's';

            return `${time.days}${time.hours}${time.minutes}${time.seconds}`;
        }

        /**
         * Gets all years object from data
         * @returns {Array}
         */
        getAllYears() {
            let allYears = [];
            for (let hostname in this.data) {
                if (!this.data.hasOwnProperty(hostname) || !this.isThisHostnameData(hostname)) continue;

                let years = this.data[hostname];
                for (let year in years) {
                    if (!years.hasOwnProperty(year) || typeof years[year] !== 'object') continue;

                    allYears.push([
                        year,
                        years[year]
                    ]);
                }
            }

            return allYears;
        }

        getAllQuarters() {
            return this.getAllStatsInGivenParentUnit(this.getAllYears());
        }

        getAllDaysOfTheWeek() {
            let allYears = this.getAllYears();
            let allDaysOfTheWeek = [];
            let weekDetails;

            for (let i = 0; i < allYears.length; i++) {
                weekDetails = allYears[i][1][config.WEEK_DETAILS];

                for (let key in weekDetails) {
                    if (!weekDetails.hasOwnProperty(key)) continue;

                    allDaysOfTheWeek.push([
                        key,
                        weekDetails[key]
                    ]);
                }
            }

            return allDaysOfTheWeek;
        }

        getAllMonths() {
            return this.getAllStatsInGivenParentUnit(this.getAllYears());
        }

        getAllDays() {
            return this.getAllStatsInGivenParentUnit(this.getAllMonths());
        }

        getAllHours() {
            return this.getAllStatsInGivenParentUnit(this.getAllDays());
        }

        getAllMinutes() {
            return this.getAllStatsInGivenParentUnit(this.getAllHours(), true);
        }

        /**
         *
         * @param parentUnit
         * @param isChildrenUnitNotObject
         * @returns {Array}
         */
        getAllStatsInGivenParentUnit(parentUnit, isChildrenUnitNotObject) {
            let unit;
            let all = [];

            for (let i = 0; i < parentUnit.length; i++) {
                unit = parentUnit[i][1];

                for (let key in unit) {
                    if (!unit.hasOwnProperty(key) || (typeof unit[key] !== 'object' && isChildrenUnitNotObject) || key === config.ALL_TIME) continue;

                    all.push([
                        key,
                        unit[key]
                    ]);
                }
            }

            return all;
        }

        /**
         * Returns an array with pages visited in given period sorted descending
         * @param {string} periodName (Today|Yesterday|Month|Year)
         * @param {string} [period]
         * @returns {Array}
         */
        getSortedPagesVisitedInGivenPeriod(periodName, period) {
            let methodName = `get${periodName}Data`;
            let pagesArray = [];
            let data = this.data;
            for (let key in data) {
                if (!data.hasOwnProperty(key)) continue;
                if (this.isThisHostnameData(key) && this[methodName](key, period)) {
                    pagesArray.push([
                        key,
                        this[methodName](key, period)[config.ALL_TIME],
                        data[key][config.FAVICON_URL]
                    ]);
                }
            }
            return this.constructor.sortDescending(pagesArray, 1);
        }

        /**
         * Checks is this hostname data by checking if it is data property, and has all_time property
         * @param {string} hostname
         * @returns {boolean}
         */
        isThisHostnameData(hostname) {
            return typeof this.data[hostname] === 'object' && !!this.data[hostname][config.ALL_TIME];
        }

        getTimeSpentInHours() {
            let hoursMap = this.constructor.createSimpleMap(24, 0);

            for (let hostname in this.data) {
                if (!this.data.hasOwnProperty(hostname)) continue;
                if (this.isThisHostnameData(hostname)) {
                    let today = this.getTodayData(hostname);
                    for (let hour in today) {
                        if (hour !== config.ALL_TIME) {
                            hoursMap[hour] += today[hour][config.ALL_TIME];
                        }
                    }
                }
            }

            return this.constructor.convertSimpleObjectToArray(hoursMap);
        }

        getTimeSpentInMinutesToday() {
            let minutesMap = this.constructor.createSimpleMap(60, 0);

            for (let hostname in this.data) {
                if (!this.data.hasOwnProperty(hostname) || !this.isThisHostnameData(hostname)) continue;

                let today = this.getTodayData(hostname);
                for (let hour in today) {
                    if (hour !== config.ALL_TIME) {
                        for (let minute in today[hour]) {
                            if (minute !== config.ALL_TIME) {
                                minutesMap[minute] += today[hour][minute];
                            }
                        }
                    }
                }
            }

            return this.constructor.convertSimpleObjectToArray(minutesMap);
        }

        getTimeSpentInMinutesGlobal() {
            let minutesMap = this.constructor.createSimpleMap(60, 0);

            for (let hostname in this.data) {
                if (!this.data.hasOwnProperty(hostname) || !this.isThisHostnameData(hostname)) continue;

                let hours = this.getAllHours(hostname);
                for (let i = 0; i < hours.length; i++) {

                }


                for (let minute in hours) {
                    if (!hours.hasOwnProperty(minute) || minute === config.ALL_TIME) continue;

                    minutesMap[minute] += hours[minute];
                }
            }

            return this.constructor.convertSimpleObjectToArray(minutesMap);
        }

        getTimeSpentInDaysOfTheWeek() {
            let daysOfTheWeekMap = this.constructor.createSimpleMap(7, 0, 1);

            for (let hostname in this.data) {
                if (!this.data.hasOwnProperty(hostname) || !this.isThisHostnameData(hostname)) continue;

                // @todo if this will launch at the beginning of new year, there will be a problem
                let weekDetails = this.getYearData(hostname)[config.WEEK_DETAILS];
                let currentWeek = utils.getCurrentWeekOfTheYear();
                let dayOfTheWeek;
                let weekOfTheYear;
                for (let week in weekDetails) {
                    if (!weekDetails.hasOwnProperty(week)) continue;

                    weekOfTheYear = week.split('-')[0];
                    dayOfTheWeek = week.split('-')[1];

                    if (weekOfTheYear === currentWeek) {
                        daysOfTheWeekMap[dayOfTheWeek] += weekDetails[week];
                    }
                }
            }

            return this.constructor.convertSimpleObjectToArray(daysOfTheWeekMap);
        }

        /**
         * After limit in the array, add all data and put it at the end of array with label 'Other'
         * @param {Array} arrayData
         * @param {number} limit
         * @returns {{
         * data: Array,
         * labels: Array
         * }}
         */
        addOtherData(arrayData, limit) {
            let other = 0;
            let result = {
                data: [],
                labels: []
            };

            for (let i = 0; i < arrayData.length; i++) {
                if (i < limit - 1) {
                    result.data.push(arrayData[i][1]);
                    result.labels.push(arrayData[i][0]);
                } else {
                    if (result.labels.indexOf('Other') === -1) {
                        result.labels.push('Other');
                    }
                    other += arrayData[i][1];
                }
            }
            result.data[result.data.length] = other;

            return result;
        }

        proceedDataProcessing() {
            this.alltime = this.constructor.parseSecondsIntoTime(this.data[config.ALL_TIME]);

            let pagesVisitedTodayArrayData = this.getSortedPagesVisitedInGivenPeriod('Today');
            this.pagesVisitedToday = this.addOtherData(pagesVisitedTodayArrayData, 10);

            let pagesVisitedYesterdayArrayData = this.getSortedPagesVisitedInGivenPeriod('Yesterday');
            this.pagesVisitedYesterday = this.addOtherData(pagesVisitedYesterdayArrayData, 10);

            let pagesVisitedThisMonthArrayData = this.getSortedPagesVisitedInGivenPeriod('Month');
            this.pagesVisitedThisMonth = this.addOtherData(pagesVisitedThisMonthArrayData, 10);

            let pagesVisitedLastMonthArrayData = this.getSortedPagesVisitedInGivenPeriod('Month', utils.getLastMonth());
            this.pagesVisitedLastMonth = this.addOtherData(pagesVisitedLastMonthArrayData, 10);

            let timeSpentInHoursDataArray = this.getTimeSpentInHours();
            this.timeSpentInHours = {
                data: timeSpentInHoursDataArray.map(hour => Math.round(hour[1] / 60)),
                labels: timeSpentInHoursDataArray.map(hour => hour[0])
            };

            let timeSpentInHoursTotalDataArray = this.getAllHours();
            let timeMap = this.constructor.createSimpleMap(24, 0);
            timeSpentInHoursTotalDataArray.map((time) => {
                timeMap[time[0]] += time[1][config.ALL_TIME];
            });
            timeSpentInHoursTotalDataArray = this.constructor.convertSimpleObjectToArray(timeMap);
            this.timeSpentInHoursTotal = {
                data: timeSpentInHoursTotalDataArray.map(hour => Math.round(hour[1] / 60)),
                labels: timeSpentInHoursTotalDataArray.map(hour => hour[0])
            };

            let timeSpentInMinutesDataArray = this.getTimeSpentInMinutesToday();
            this.timeSpentInMinutes = {
                data: timeSpentInMinutesDataArray.map(minute => minute[1]),
                labels: timeSpentInMinutesDataArray.map(minute => minute[0])
            };

            // let timeSpentInMinutesGlobalDataArray = this.getTimeSpentInMinutesGlobal();
            // this.timeSpentInMinutesGlobal = {
            //     data: timeSpentInMinutesGlobalDataArray.map(minute => minute[1]),
            //     labels: timeSpentInMinutesGlobalDataArray.map(minute => minute[0])
            // };

            let timeSpentEachDayOfTheWeekDataArray = this.getTimeSpentInDaysOfTheWeek();
            this.timeSpentEachDayOfTheWeek = {
                data: timeSpentEachDayOfTheWeekDataArray.map(dayOfTheWeek => Math.round(dayOfTheWeek[1] / 60)),
                labels: timeSpentEachDayOfTheWeekDataArray.map(dayOfTheWeek => this.constructor.convertDayOfTheWeekToName(dayOfTheWeek[0]))
            };
        }
    };

}));