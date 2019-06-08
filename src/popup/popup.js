/* eslint-disable */
import '@babel/polyfill';
import config from '../js/config';
import utils from '../js/utils';
import DataProcessing from '../js/DataProcessing';
import Chart from 'chart.js/dist/Chart.bundle.min.js';
import './style.scss';
import App from "./App.jsx";

let data = new DataProcessing(config.EXTENSION_DATA_NAME);

function show() {

    // @todo generate empty chart if data is not available
  function generateCharts() {
      let todayChart = new Chart(document.getElementById('myChartToday'), {
        type: 'doughnut',
        data: {
          datasets: [{
            data: data.pagesVisitedToday.data,
            // @todo colors from favicos: https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
            backgroundColor: data.pagesVisitedToday.colors
          }],

          // These labels appear in the legend and in the tooltips when hovering different arcs
          labels: data.pagesVisitedToday.labels,
        },
        options: {
          customTextInside: DataProcessing.parseSecondsIntoTime(data.pagesVisitedToday.data.reduce((a, b) => a + b, 0)),
          tooltips: {
            callbacks: {
              label(tooltipItem, chart) {
                let seconds = chart.datasets[0].data[tooltipItem.index];
                let labelText = chart.labels[tooltipItem.index];
                return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
              }
            }
          },
          legend: {
            labels: {
              usePointStyle: true
            },
            position: 'right'
          }
        },
      });

      let yesterdayChart = new Chart(document.getElementById('myChartYesterday'), {
        type: 'doughnut',
        data: {
          datasets: [{
            data: data.pagesVisitedYesterday.data,
            backgroundColor: data.pagesVisitedYesterday.colors
          }],
          labels: data.pagesVisitedYesterday.labels
        },
        options: {
          customTextInside: DataProcessing.parseSecondsIntoTime(data.pagesVisitedYesterday.data.reduce((a, b) => a + b, 0)),
          tooltips: {
            callbacks: {
              label(tooltipItem, chart) {
                let seconds = chart.datasets[0].data[tooltipItem.index];
                let labelText = chart.labels[tooltipItem.index];
                return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
              }
            }
          },
          legend: {
            labels: {
              usePointStyle: true
            },
            position: 'right'
          }
        }
      });

      let monthChart = new Chart(document.getElementById('myChartMonth'), {
        type: 'doughnut',
        data: {
          datasets: [{
            data: data.pagesVisitedThisMonth.data,
            backgroundColor: data.pagesVisitedThisMonth.colors
          }],
          labels: data.pagesVisitedThisMonth.labels
        },
        options: {
          customTextInside: DataProcessing.parseSecondsIntoTime(data.pagesVisitedThisMonth.data.reduce((a, b) => a + b, 0)),
          tooltips: {
            callbacks: {
              label(tooltipItem, chart) {
                let seconds = chart.datasets[0].data[tooltipItem.index];
                let labelText = chart.labels[tooltipItem.index];
                return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
              }
            }
          },
          legend: {
            labels: {
              usePointStyle: true
            },
            position: 'right'
          }
        }
      });

      let lastMonthChart = new Chart(document.getElementById('myChartLastMonth'), {
          type: 'doughnut',
          data: {
              datasets: [{
                  data: data.pagesVisitedLastMonth.data,
                  backgroundColor: data.pagesVisitedLastMonth.colors
              }],
              labels: data.pagesVisitedLastMonth.labels
          },
          options: {
            customTextInside: DataProcessing.parseSecondsIntoTime(data.pagesVisitedLastMonth.data.reduce((a, b) => a + b, 0)),
              tooltips: {
                  callbacks: {
                      label(tooltipItem, chart) {
                          let seconds = chart.datasets[0].data[tooltipItem.index];
                          let labelText = chart.labels[tooltipItem.index];
                          return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
                      }
                  }
              },
              legend: {
                  labels: {
                      usePointStyle: true
                  },
                  position: 'right'
              }
          }
      });

      let myChartTimeTodayHours = new Chart(document.getElementById('myChartTimeTodayHours'), {
          type: 'line',
          data: {
              datasets: [{
                  yAxisID: 'Today',
                  label:'Time in minutes Today',
                  data: data.timeSpentInHours.data,
                  borderColor: 'rgb(0, 102, 255)',
                  backgroundColor: 'rgb(77, 148, 255)',
              }, {
                  yAxisID: 'Global',
                  label:'Time in minutes Global',
                  data: data.timeSpentInHoursTotal.data,
                  borderColor: 'rgb(243, 26, 11)',
                  backgroundColor: 'rgb(249, 106, 95)',
              }],
              labels: data.timeSpentInHoursTotal.labels,
          },
          options: {
              scales: {
                  yAxes: [{
                      id: 'Today',
                      position: 'left',
                      type: 'linear',
                      ticks: {
                          suggestedMin: 0,
                          suggestedMax: 60
                      },
                      scaleLabel: {
                          display: true,
                          labelString: 'Today in minutes',
                      }
                  }, {
                      id: 'Global',
                      position: 'right',
                      type: 'linear',
                      scaleLabel: {
                          display: true,
                          labelString: 'Total in minutes',
                      }
                  }]
              }
          }
      });

    let myChartTimDaysOfTheWeek = new Chart(document.getElementById('myChartTimDaysOfTheWeek'), {
      type: 'line',
      data: {
        datasets: [{
          yAxisID: 'CurrentWeek',
          label:'Time in minutes',
          data: data.timeSpentEachDayOfTheWeek.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }, {
          yAxisID: 'Global',
          label:'Time in minutes total',
          data: data.timeSpentEachDayOfTheWeekTotal.data,
          borderColor: 'rgb(243, 26, 11)',
          backgroundColor: 'rgb(249, 106, 95)',
        }],
        labels: data.timeSpentEachDayOfTheWeekTotal.labels,
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
            }
          }, {
            id: 'Global',
            position: 'right',
            type: 'linear',
            scaleLabel: {
                display: true,
                labelString: 'Total in minutes',
            }
          }]
        }
      }
    });

    let myChartTimeTodayMinutes = new Chart(document.getElementById('myChartTimeTodayMinutes'), {
      type: 'line',
      data: {
        datasets: [{
          label:'Time in seconds',
          data: data.timeSpentInMinutes.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }],
        labels: data.timeSpentInMinutes.labels,
      }
    });
  }

  data.loadFromStorage().then(() => {
    utils.debugLog('Generated data:', data);

    data.proceedDataProcessing();

    document.getElementById('totalTime').textContent = data.alltime;
    document.getElementById('firstVisit').textContent = data.data[config.FIRST_VISIT];

    generateCharts();
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

chrome.runtime.sendMessage({event: 'openPopup'}, (response) => {
  Chart.pluginService.register({
    beforeDraw: function(chart) {
      if (chart && chart.options && chart.options.customTextInside) {
        const height = chart.chart.height;
        const ctx = chart.chart.ctx;

        ctx.restore();
        ctx.font = "20px sans-serif";
        ctx.textBaseline = "middle";

        const text = chart.options.customTextInside;
        const textX = Math.round((chart.chartArea.right - ctx.measureText(text).width) / 2);
        const textY = height / 2;

        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    }
  });

  if (response) {
    if (document.readyState !== 'loading') {
      show();
    } else {
      document.addEventListener('DOMContentLoaded', show);
    }
  }
});
