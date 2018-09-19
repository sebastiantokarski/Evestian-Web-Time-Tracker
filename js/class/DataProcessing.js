/* global chrome, define, module */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./Data.js', '../config.js', '../utils.js'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.DataProcessing = factory();
    }
}(this, (Data, config, utils) => {

    return class DataProcessing extends Data {
        constructor(dataName) {
            super(dataName);
        }

        /**
         * Sorts descending tables
         * @param {Array} array
         * @param {number} indexToCompare
         * @returns {*|void}
         */
        sortDescending(array, indexToCompare) {
            return array.sort(function (a, b) {
                return b[indexToCompare] - a[indexToCompare];
            });
        }

        /**
         * Returns an array with pages visited in given period
         * @param {string} methodName (getToday|getYesterday)
         * @param {string} [period]
         * @returns {Array}
         */
        getPagesVisitedInGivenPeriod(methodName, period) {

            let pagesArray = [];
            let data = this.data;
            for (let key in data) {
                if (data.hasOwnProperty(key) && key !== config.FIRST_VISIT && key !== config.ALL_TIME && this[methodName](key, period)) {
                    pagesArray.push([
                        key,
                        this[methodName](key, period)[config.ALL_TIME],
                        data[key].favicon
                    ]);
                }
            }
            return pagesArray;
        }

        parseSecondsIntoTime(seconds) {

            let time = {
                days: '',
                hours: '',
                minutes: '',
                seconds
            };

            let oneDay = 60 * 60 * 24,
                oneHour = 60 * 60,
                oneMinute = 60;

            if (time.seconds > oneDay) {
                time.days = Math.floor(time.seconds / 60 / 60 / 24);
                time.seconds -= (time.days * oneDay);
                time.days = time.days + 'd';
            }

            if (time.seconds > oneHour) {
                time.hours = Math.floor(time.seconds / 60 / 60);
                time.seconds -= (time.hours * oneHour);
                time.hours = time.days ? ('0' + time.hours).slice(-2) + 'h' : time.hours + 'h';
            }

            if (time.seconds > oneMinute) {
                time.minutes = Math.floor(time.seconds / 60);
                time.seconds -= (time.minutes * oneMinute);
                time.minutes = time.hours ? ('0' + time.minutes).slice(-2) + 'm' : time.minutes + 'm';
            }

            time.seconds = time.minutes ? ('0' + time.seconds).slice(-2) + 's' : time.seconds + 's';

            return `${time.days}${time.hours}${time.minutes}${time.seconds}`;
        }

        // @todo generate empty chart if data is not available
        generateChart() {
            let self = this;
            let todayChart = new Chart(document.getElementById('myChartToday'), {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: this.pagesVisitedToday.map((page) => page[1]).slice(0, 10),
                        // @todo colors from favicos: https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
                        backgroundColor: ['red', 'orange', 'purple', 'green', 'yellow', 'blue', 'brown', 'lime', 'pink']
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: this.pagesVisitedToday.map((page) => page[0]).slice(0, 10),
                },
                options: {
                    tooltips: {
                        callbacks: {
                            label(tooltipItem, chart) {
                                let seconds = chart.datasets[0].data[tooltipItem.index];
                                let labelText = chart.labels[tooltipItem.index];
                                return `${labelText}: ${self.parseSecondsIntoTime(seconds)}`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            });

            let yesterdayChart = new Chart(document.getElementById('myChartYesterday'), {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: this.pagesVisitedYesterday.map((page) => page[1]).slice(0, 10),
                        backgroundColor: ['red', 'orange', 'purple', 'green', 'yellow', 'blue', 'brown', 'lime', 'pink']
                    }],
                    labels: this.pagesVisitedYesterday.map((page) => page[0]).slice(0, 10),
                },
                options: {
                    tooltips: {
                        callbacks: {
                            label(tooltipItem, chart) {
                                let seconds = chart.datasets[0].data[tooltipItem.index];
                                let labelText = chart.labels[tooltipItem.index];
                                return `${labelText}: ${self.parseSecondsIntoTime(seconds)}`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            });
        }

        proceedDataProcessing() {
            this.alltime = this.data[config.ALL_TIME];

            this.pagesVisitedToday = this.getPagesVisitedInGivenPeriod('getTodayFor');
            this.pagesVisitedToday = this.sortDescending(this.pagesVisitedToday, 1);

            this.pagesVisitedYesterday = this.getPagesVisitedInGivenPeriod('getYesterdayFor');
            this.pagesVisitedYesterday = this.sortDescending(this.pagesVisitedYesterday, 1);

            this.pagesVisitedThisMonth = this.getPagesVisitedInGivenPeriod('getMonthFor');
            this.pagesVisitedThisMonth = this.sortDescending(this.pagesVisitedThisMonth, 1);

            this.pagesVisitedLastMonth = this.getPagesVisitedInGivenPeriod('getMonthFor', utils.getLastMonth());
            this.pagesVisitedLastMonth = this.sortDescending(this.pagesVisitedLastMonth, 1);

            this.pagesVisitedThisQuarter = this.getPagesVisitedInGivenPeriod('getQuarterFor', utils.getCurrentQuarter());
            this.pagesVisitedThisQuarter = this.sortDescending(this.pagesVisitedThisQuarter, 1);

            this.pagesVisitedLastQuarter = this.getPagesVisitedInGivenPeriod('getQuarterFor', utils.getLastQuarter());
            this.pagesVisitedLastQuarter = this.sortDescending(this.pagesVisitedLastQuarter, 1);

            this.generateChart();

            /* eslint-disable no-console */
            console.log(this);
            /* eslint-enable no-console */
        }
    };

}));