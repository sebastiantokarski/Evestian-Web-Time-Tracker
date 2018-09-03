/* jshint esversion: 6 */
/* global chrome */

document.addEventListener('DOMContentLoaded', () => {
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


    chrome.storage.local.get(EXTENSION_DATA, (storage) => {
        let data = null;
        if (storage[EXTENSION_DATA]) {
            data = JSON.parse(storage['data']);
            let arr = [];
            for (let key in data) {
                if ({}.hasOwnProperty.call(data, key) && data[key]) {
                    arr.push([key, data[key].alltime, data[key].favicon]);
                }
            }
            arr.sort(function(a, b) {
                return b[1] - a[1];
            });
            showResults(arr);
        }
    });
});

