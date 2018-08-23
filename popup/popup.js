document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(EXTENSION_DATA, (storage) => {
        let data = null;
        if (storage[EXTENSION_DATA]) {
            data = JSON.parse(storage['data']);
            let arr = [];
            for (let key in data) {
                arr.push([key, data[key].alltime]);
            }
            arr.sort(function(a, b) {
                return b[1] - a[1];
            });
            showResults(arr);
        }
    });

    function showResults(data) {
        let table = document.createElement('table');
        for (let i = 0; i < data.length; i++) {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td>${i + 1}</td><td>${data[i][0]}</td><td>${prepareTimeToShow(data[i][1])}</td>`;
            table.appendChild(tr);
        }
        document.body.appendChild(table);
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
});

