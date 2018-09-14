/* global chrome, requirejs */

requirejs(['../js/config.js', '../js/utils.js', '../node_modules/chart.js/dist/Chart.js'], function(config, utils, Chart) {

    function show() {

        /**
         * @todo! This function is so bad! :D
         */
        function prepareTimeToShow(timeInSeconds) {
            let time = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: timeInSeconds
            };

            if (time.seconds > 60 * 60 * 24) {
                time.days = Math.floor(time.seconds / 60 / 60 / 24);
                time.seconds -= (time.days * 60 * 60 * 24);
                time.days = `<strong>${('0' + time.days).slice(-2)}</strong>`;
            } else {
                time.days = '0' + time.days;
            }

            if (time.seconds > 60 * 60) {
                time.hours = Math.floor(time.seconds / 60 / 60);
                time.seconds -= (time.hours * 60 * 60);
                time.hours = `<strong>${('0' + time.hours).slice(-2)}</strong>`;
            } else {
                time.hours = '0' + time.hours;
            }

            if (time.seconds > 60) {
                time.minutes = Math.floor(time.seconds / 60);
                time.seconds -= (time.minutes * 60);
                time.minutes = `<strong>${('0' + time.minutes).slice(-2)}</strong>`;
            } else {
                time.minutes = '0' + time.minutes;
            }

            time.seconds = `<strong>${('0' + time.seconds).slice(-2)}</strong>`;

            return `${time.days}d${time.hours}h${time.minutes}m${time.seconds}s`;
        }

        function showResults(data) {
            let table = document.createElement('table');
            for (let i = 0; i < data.length; i++) {
                let tr = document.createElement('tr');
                if (!data[i][2]) {
                    data[i][2] = chrome.runtime.getURL('assets/defaultFavicon16.png');
                }
                tr.innerHTML = `<td>${i + 1}</td><td><img src="${data[i][2]}" height="16" width="16"></td></td><td>${data[i][0]}</td><td>${prepareTimeToShow(data[i][1])}</td>`;
                table.appendChild(tr);
            }
            document.body.insertBefore(table, document.querySelector('.flaticon-desc'));
        }

        chrome.storage.local.get(config.EXTENSION_DATA, (storage) => {
            let data = null;
            if (storage[config.EXTENSION_DATA]) {
                data = JSON.parse(storage['data']);
                let arr = [];
                for (let key in data) {
                    if ({}.hasOwnProperty.call(data, key) && data[key] && data[key].alltime) {
                        arr.push([key, data[key].alltime, data[key].favicon]);
                    }
                }
                arr.sort(function (a, b) {
                    return b[1] - a[1];
                });
                showResults(arr);
            }
        });
    }

    chrome.runtime.sendMessage({event: 'openPopup'}, (response) => {
        if (response) {
            if (document.readyState !== 'loading') {
                show();
            } else {
                document.addEventListener('DOMContentLoaded', show);
            }
        }
    });


    class Data {
        constructor(dataName) {
            let self = this;
            chrome.storage.local.get(dataName, (storage) => {
                if (storage[dataName]) {
                    self.originalData = JSON.parse(storage[dataName]);
                    utils.prepareDataObjectMethods(self.originalData);
                    self.proceedDataProcessing();
                } else {
                    throw(`${dataName} not found in storage`);
                }
            });
        }

        /**
         * Sorts descending tables
         * @param {Array} array
         * @param {number} indexToCompare
         * @returns {*|void}
         */
        sortDescending(array, indexToCompare) {
            return array.sort(function(a, b) {
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
            let data = this.originalData;
            for (let key in data) {
                if (data.hasOwnProperty(key) && key !== config.ALL_TIME && data[methodName](key, period)) {
                    pagesArray.push([
                        key,
                        data[methodName](key, period)[config.ALL_TIME],
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
                            label: function (tooltipItem, chart) {
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
            this.alltime = this.originalData[config.ALL_TIME];

            this.pagesVisitedToday = this.getPagesVisitedInGivenPeriod('getToday');
            this.pagesVisitedToday = this.sortDescending(this.pagesVisitedToday, 1);

            this.pagesVisitedYesterday = this.getPagesVisitedInGivenPeriod('getYesterday');
            this.pagesVisitedYesterday = this.sortDescending(this.pagesVisitedYesterday, 1);

            this.pagesVisitedThisMonth = this.getPagesVisitedInGivenPeriod('getMonth');
            this.pagesVisitedThisMonth = this.sortDescending(this.pagesVisitedThisMonth, 1);

            this.pagesVisitedLastMonth = this.getPagesVisitedInGivenPeriod('getMonth', utils.getLastMonth());
            this.pagesVisitedLastMonth = this.sortDescending(this.pagesVisitedLastMonth, 1);

            this.pagesVisitedThisQuarter = this.getPagesVisitedInGivenPeriod('getQuarter', utils.getCurrentQuarter());
            this.pagesVisitedThisQuarter = this.sortDescending(this.pagesVisitedThisQuarter, 1);

            this.pagesVisitedLastQuarter = this.getPagesVisitedInGivenPeriod('getQuarter', utils.getLastQuarter());
            this.pagesVisitedLastQuarter = this.sortDescending(this.pagesVisitedLastQuarter, 1);

            this.generateChart();

            /* eslint-disable no-console */
            console.log(this);
            /* eslint-enable no-console */
        }
    }

    let a = new Data('data');
});
