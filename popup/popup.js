/* jshint esversion: 6 */
/* global chrome, DEVELOPMENT_MODE, EXTENSION_DATA, DISPLAY_BADGE,
COUNT_ONLY_ACTIVE_STATE, INTERVAL_UPDATE_S, INTERVAL_UPDATE_MIN,
BLACKLIST_PROTOCOL*/

requirejs(['../js/config.js', '../js/utils.js', '../node_modules/chart.js/dist/Chart.js'], function(config, utils, Chart) {

    chrome.runtime.sendMessage({event: 'openPopup'}, (response) => {
        if (response) {
            if (document.readyState !== 'loading') {
                show();
            } else {
                document.addEventListener('DOMContentLoaded', show);
            }
        }
    });

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


        chrome.storage.local.get(EXTENSION_DATA, (storage) => {
            let data = null;
            if (storage[EXTENSION_DATA]) {
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

    class Data {
        constructor(dataName) {
            let self = this;
            chrome.storage.local.get(dataName, (storage) => {
                if (storage[dataName]) {
                    self.originalData = JSON.parse(storage[dataName]);
                    self.proceedDataProcessing(self);
                } else {
                    throw(`${dataName} not found in storage`);
                }
            });
        }

        sortArray(array, index) {
            return array.sort(function(a, b) {
                return b[index] - a[index];
            });
        }

        getDateString() {
            const date = new Date(),
                year = date.getFullYear(),
                month = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return `${year}-${month}-${day}`;
        }

        getPagesVisitedToday(self) {
            let pagesArray = [];
            let data = self.originalData;
            for (let key in data) {
                if (data.hasOwnProperty(key) && data[key].days && data[key].days[self.getDateString()]) {
                    pagesArray.push([
                        key,
                        data[key].days[self.getDateString()],
                        data[key].favicon
                    ]);
                }
            }
            return pagesArray;
        }

        proceedDataProcessing(self) {
            self.alltime = self.originalData.alltime;
            self.pagesVisitedToday = self.getPagesVisitedToday(self);
            self.pagesVisitedToday = self.sortArray(self.pagesVisitedToday, 1);
            console.log(self);
            new Chart(document.getElementById("myChart"), {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: (() => {
                            let pagesVisitedToday = self.pagesVisitedToday;
                            let arr = [];
                            for (let i = 0; i < pagesVisitedToday.length; i++) {
                                arr.push(pagesVisitedToday[i][1]);
                            }
                            return arr;
                        })(),
                        backgroundColor: ['pink','blue','silver','black']
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: (() => {
                        let pagesVisitedToday = self.pagesVisitedToday;
                        let arr = [];
                        for (let i = 0; i < pagesVisitedToday.length; i++) {
                            arr.push(pagesVisitedToday[i][0]);
                        }
                        return arr;
                    })(),
                }
            });
        }
    }

    let a = new Data('data');
});
