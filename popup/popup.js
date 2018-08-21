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
            tr.innerHTML = `<td>${i + 1}</td><td>${data[i][0]}</td><td>${data[i][1]}</td>`;
            table.appendChild(tr);
        }
        document.body.appendChild(table);
    }
});

