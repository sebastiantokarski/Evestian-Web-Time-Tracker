/* global chrome, requirejs */

requirejs([
    '../js/config.js',
    '../js/utils.js',
    '../node_modules/chart.js/dist/Chart.js',
    '../js/class/DataProcessing.js'
], function(config, utils, Chart, DataProcessing) {

    function show() {

        let data = new DataProcessing(config.EXTENSION_DATA_NAME);
        data.loadFromStorage().then(() => {
            data.proceedDataProcessing();
        });

        function showResults(arr) {
            let table = document.createElement('table');
            table.setAttribute('style', 'margin: auto; font-size: 16px');
            for (let i = 0; i < arr.length; i++) {
                let tr = document.createElement('tr');
                if (!arr[i][2]) {
                    arr[i][2] = chrome.runtime.getURL('assets/defaultFavicon16.png');
                }
                tr.innerHTML = `<td>${i + 1}</td><td><img src="${arr[i][2]}" height="16" width="16"></td></td><td>${arr[i][0]}</td><td>${data.parseSecondsIntoTime(arr[i][1])}</td>`;
                table.appendChild(tr);
            }
            document.querySelector('.container-table').appendChild(table);
        }

        chrome.storage.local.get(config.EXTENSION_DATA_NAME, (storage) => {
            let data = null;
            if (storage[config.EXTENSION_DATA_NAME]) {
                data = storage[config.EXTENSION_DATA_NAME];
                let arr = [];
                for (let key in data) {
                    if ({}.hasOwnProperty.call(data, key) && data[key] && data[key]['firstVisit']) {
                        arr.push([
                            key,
                            // @todo temp
                            data[key]['2018'][config.ALL_TIME],
                            data[key].favicon]);
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
});
