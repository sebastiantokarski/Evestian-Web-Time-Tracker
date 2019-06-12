/* eslint-disable */
import '@babel/polyfill';
import config from '../js/config';
import utils from '../js/utils';
import thenChrome from 'then-chrome';
import DataProcessing from '../js/DataProcessing';
import Chart from 'chart.js/dist/Chart.bundle.min.js';
import './style.scss';
// eslint-disable-next-line
import App from "./App.jsx";

/** Class Popup */
class Popup {
  /**
   * @param {string} dataName
   */
  constructor(dataName) {
    this.data = new DataProcessing(dataName);
  }

  async init() {
    const waitForDataUpdate = await thenChrome.runtime.sendMessage({event: 'openPopup'});

    this.initOnDOMContentReady(this.show.bind(this));
  }

  /**
   *
   * @param {Function} callback
   */
  initOnDOMContentReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  show() {
    this.data.loadFromStorage().then(() => {
      utils.debugLog('Generated data:', this.data);

      this.data.proceedDataProcessing();

      document.getElementById('totalTime').textContent = this.data.alltime;
      document.getElementById('firstVisit').textContent = this.data.data[config.FIRST_VISIT];

      this.generateCharts();
    });

    function showResults(arr) {
      const table = document.createElement('table');
      table.setAttribute('style', 'margin: auto; font-size: 16px');
      for (let i = 0; i < arr.length; i++) {
        const tr = document.createElement('tr');
        if (!arr[i][2]) {
          arr[i][2] = chrome.runtime.getURL('/assets/defaultFavicon16.png');
        }
        tr.innerHTML = `<td>${i + 1}</td><td><img src="${arr[i][2]}" height="16" width="16"></td></td><td>${arr[i][0]}</td><td>${DataProcessing.parseSecondsIntoTime(arr[i][1])}</td>`;
        table.appendChild(tr);
      }
      document.querySelector('.container-table').appendChild(table);
    }

    chrome.storage.local.get(config.EXTENSION_DATA_NAME, (storage) => {
      let data = null;
      if (storage[config.EXTENSION_DATA_NAME]) {
        data = storage[config.EXTENSION_DATA_NAME];
        const arr = [];
        for (const key in data) {
          if ({}.hasOwnProperty.call(data, key) && data[key] && data[key][config.FIRST_VISIT]) {
            arr.push([
              key,
              data[key][config.ALL_TIME],
              data[key][config.FAVICON_URL],
            ]);
          }
        }
        arr.sort(function(a, b) {
          return b[1] - a[1];
        });

        showResults(arr);
      }
    });
  }

  generateCharts() {
    this.todayChart = new Chart(document.getElementById('myChartToday'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedToday.data,
          // @todo colors from favicos: https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
          backgroundColor: this.data.pagesVisitedToday.colors
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: this.data.pagesVisitedToday.labels,
      },
      options: {
        customTextInside: DataProcessing.parseSecondsIntoTime(this.data.pagesVisitedToday.data.reduce((a, b) => a + b, 0)),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        legend: {
          labels: {
            usePointStyle: true,
          },
          position: 'right',
        },
      },
    });

    this.yesterdayChart = new Chart(document.getElementById('myChartYesterday'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedYesterday.data,
          backgroundColor: this.data.pagesVisitedYesterday.colors,
        }],
        labels: this.data.pagesVisitedYesterday.labels,
      },
      options: {
        customTextInside: DataProcessing.parseSecondsIntoTime(this.data.pagesVisitedYesterday.data.reduce((a, b) => a + b, 0)),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        legend: {
          labels: {
            usePointStyle: true,
          },
          position: 'right',
        },
      },
    });

    this.monthChart = new Chart(document.getElementById('myChartMonth'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedThisMonth.data,
          backgroundColor: this.data.pagesVisitedThisMonth.colors,
        }],
        labels: this.data.pagesVisitedThisMonth.labels,
      },
      options: {
        customTextInside: DataProcessing.parseSecondsIntoTime(this.data.pagesVisitedThisMonth.data.reduce((a, b) => a + b, 0)),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        legend: {
          labels: {
            usePointStyle: true,
          },
          position: 'right',
        },
      },
    });

    this.lastMonthChart = new Chart(document.getElementById('myChartLastMonth'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedLastMonth.data,
          backgroundColor: this.data.pagesVisitedLastMonth.colors,
        }],
        labels: this.data.pagesVisitedLastMonth.labels,
      },
      options: {
        customTextInside: DataProcessing.parseSecondsIntoTime(this.data.pagesVisitedLastMonth.data.reduce((a, b) => a + b, 0)),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        legend: {
          labels: {
            usePointStyle: true,
          },
          position: 'right',
        },
      },
    });

    this.myChartTimeTodayHours = new Chart(document.getElementById('myChartTimeTodayHours'), {
      type: 'line',
      data: {
        datasets: [{
          yAxisID: 'Today',
          label: 'Time in minutes Today',
          data: this.data.timeSpentInHours.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }, {
          yAxisID: 'Global',
          label: 'Time in minutes Global',
          data: this.data.timeSpentInHoursTotal.data,
          borderColor: 'rgb(243, 26, 11)',
          backgroundColor: 'rgb(249, 106, 95)',
        }],
        labels: this.data.timeSpentInHoursTotal.labels,
      },
      options: {
        scales: {
          yAxes: [{
            id: 'Today',
            position: 'left',
            type: 'linear',
            ticks: {
              suggestedMin: 0,
              suggestedMax: 60,
            },
            scaleLabel: {
              display: true,
              labelString: 'Today in minutes',
            },
          }, {
            id: 'Global',
            position: 'right',
            type: 'linear',
            scaleLabel: {
              display: true,
              labelString: 'Total in minutes',
            },
          }],
        },
      },
    });

    this.myChartTimDaysOfTheWeek = new Chart(document.getElementById('myChartTimDaysOfTheWeek'), {
      type: 'line',
      data: {
        datasets: [{
          yAxisID: 'CurrentWeek',
          label: 'Time in minutes',
          data: this.data.timeSpentEachDayOfTheWeek.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }, {
          yAxisID: 'Global',
          label: 'Time in minutes total',
          data: this.data.timeSpentEachDayOfTheWeekTotal.data,
          borderColor: 'rgb(243, 26, 11)',
          backgroundColor: 'rgb(249, 106, 95)',
        }],
        labels: this.data.timeSpentEachDayOfTheWeekTotal.labels,
      },
      options: {
        scales: {
          yAxes: [{
            id: 'CurrentWeek',
            position: 'left',
            type: 'linear',
            scaleLabel: {
              display: true,
              labelString: 'Today in minutes',
            },
          }, {
            id: 'Global',
            position: 'right',
            type: 'linear',
            scaleLabel: {
              display: true,
              labelString: 'Total in minutes',
            },
          }],
        },
      },
    });

    this.myChartTimeTodayMinutes = new Chart(document.getElementById('myChartTimeTodayMinutes'), {
      type: 'line',
      data: {
        datasets: [{
          label: 'Time in seconds',
          data: this.data.timeSpentInMinutes.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }],
        labels: this.data.timeSpentInMinutes.labels,
      },
    });
  }
}
const popup = new Popup(config.EXTENSION_DATA_NAME);

popup.init();
