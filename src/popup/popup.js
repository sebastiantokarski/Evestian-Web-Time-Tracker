import '@babel/polyfill';
import config from '../js/config';
import utils from '../js/utils';
import thenChrome from 'then-chrome';
import DataProcessing from '../js/DataProcessing';
import Chart from 'chart.js/dist/Chart.bundle.min.js';
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

  /**
   * Set custom chart.js methods.
   */
  setCustomChartMethods() {
    Chart.pluginService.register({
      beforeDraw: function(chart) {
        if (chart && chart.options && chart.options.customTextInside) {
          const height = chart.chartArea.bottom;
          const rightCorner = chart.chartArea.right;
          const ctx = chart.chart.ctx;

          ctx.restore();
          ctx.font = '20px sans-serif';
          ctx.textBaseline = 'middle';

          const text = chart.options.customTextInside;
          const textX = Math.round((rightCorner - ctx.measureText(text).width) / 2);
          const textY = height / 2;

          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      },
    });
  }

  /**
   * Initialize Popup.
   *
   * @return {undefined}
   */
  async init() {
    // Wait for data update
    await thenChrome.runtime.sendMessage({event: 'openPopup'});

    this.initOnDOMContentReady(this.show.bind(this));
    this.setCustomChartMethods();
  }

  /**
   * @param {string} id - Selector id.
   * @return {HTMLElement}
   */
  getById(id) {
    return document.getElementById(id);
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

  onChartHover(chartName, dataName, event, items) {
    const chart = this[chartName];

    if (event.layerY > chart.chartArea.bottom) {
      return;
    }

    if (items.length) {
      const itemIndex = items[0]._index;
      const chartDataset = chart.data.datasets[0];
      const text = DataProcessing.parseSecondsIntoTime(chartDataset.data[itemIndex]);

      chart.options.customTextInside = text;
      chart.update();
    } else {
      const customTextInside = this.parseTextInsideChart(this.data[dataName]);

      if (chart.options.customTextInside !== customTextInside) {
        chart.options.customTextInside = customTextInside;
        chart.update();
      }
    }
  }

  /**
   * Shows all stats and charts in popup.
   */
  show() {
    this.data.loadFromStorage().then(() => {
      const firstVisitNode = document.getElementById('firstVisit');
      const totalTimeNode = document.getElementById('totalTime');

      utils.debugLog('Generated data:', this.data);

      this.data.proceedDataProcessing();

      totalTimeNode.textContent = this.data.alltime;
      firstVisitNode.textContent = this.data.data[config.FIRST_VISIT];

      this.generateCharts();
      this.generateTables();
    });
  }

  /**
   * @param  {object} data
   * @return {string}
   */
  parseTextInsideChart(data) {
    return DataProcessing.parseSecondsIntoTime(data.data.reduce((a, b) => a + b, 0));
  }

  generateTables() {
    const todayTable = document.querySelector('.myChartTodayTable');
    const yesterdayTable = document.querySelector('.myChartYesterdayTable');
    const thisMonthTable = document.querySelector('.myChartThisMonthTable');
    const lastMonthTable = document.querySelector('.myChartLastMonthTable');

    this.generateTable(todayTable, this.data.pagesVisitedTodayArrayData);
    this.generateTable(yesterdayTable, this.data.pagesVisitedYesterdayArrayData);
    this.generateTable(thisMonthTable, this.data.pagesVisitedThisMonthArrayData);
    this.generateTable(lastMonthTable, this.data.pagesVisitedLastMonthArrayData);
  }

  generateTable(table, data) {
    const defaultUrl = chrome.runtime.getURL('/assets/defaultFavicon16.png');
    const tableInnerHTML = data.map((item, key) => {
      return `
        <tr>
          <td>${key + 1}</td>
          <td class="favImageCell" data-src="${item[2]}"></td>
          <td>${item[0]}</td>
          <td class="spentTimeCell">${DataProcessing.parseSecondsIntoTime(item[1])}</td>
        </tr>
      `;
    }).join('');

    table.innerHTML = tableInnerHTML;

    [].map.call(table.querySelectorAll('.favImageCell'), (imageCell) => {
      const image = document.createElement('img');

      image.classList.add('favImage');
      image.src = imageCell.dataset.src;
      delete imageCell.dataset.src;
      image.onerror = (ev) => ev.target.src = defaultUrl;
      imageCell.appendChild(image);
    });
  }

  /**
   * Generate all charts.
   */
  generateCharts() {
    this.todayChart = new Chart(this.getById('myChartToday'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedToday.data,
          backgroundColor: this.data.pagesVisitedToday.colors,
        }],
        labels: this.data.pagesVisitedToday.labels.map((label) => {
          return label.length > 24 ? label.slice(0, 24) + '...' : label;
        }),
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.data.pagesVisitedToday),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        hover: {
          onHover: this.onChartHover.bind(this, 'todayChart', 'pagesVisitedToday'),
        },
        animation: {
          animateScale: true,
        },
        legend: {
          display: false,
        },
      },
    });


    this.yesterdayChart = new Chart(this.getById('myChartYesterday'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedYesterday.data,
          backgroundColor: this.data.pagesVisitedYesterday.colors,
        }],
        labels: this.data.pagesVisitedYesterday.labels,
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.data.pagesVisitedYesterday),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        hover: {
          onHover: this.onChartHover.bind(this, 'yesterdayChart', 'pagesVisitedYesterday'),
        },
        legend: {
          display: false,
        },
      },
    });

    this.monthChart = new Chart(this.getById('myChartMonth'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedThisMonth.data,
          backgroundColor: this.data.pagesVisitedThisMonth.colors,
        }],
        labels: this.data.pagesVisitedThisMonth.labels,
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.data.pagesVisitedThisMonth),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        hover: {
          onHover: this.onChartHover.bind(this, 'monthChart', 'pagesVisitedThisMonth'),
        },
        legend: {
          display: false,
        },
      },
    });

    this.lastMonthChart = new Chart(this.getById('myChartLastMonth'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.data.pagesVisitedLastMonth.data,
          backgroundColor: this.data.pagesVisitedLastMonth.colors,
        }],
        labels: this.data.pagesVisitedLastMonth.labels,
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.data.pagesVisitedLastMonth),
        tooltips: {
          callbacks: {
            label(tooltipItem, chart) {
              const seconds = chart.datasets[0].data[tooltipItem.index];
              const labelText = chart.labels[tooltipItem.index];

              return `${labelText}: ${DataProcessing.parseSecondsIntoTime(seconds)}`;
            },
          },
        },
        hover: {
          onHover: this.onChartHover.bind(this, 'lastMonthChart', 'pagesVisitedLastMonth'),
        },
        legend: {
          display: false,
        },
      },
    });

    this.myChartTimeTodayHours = new Chart(this.getById('myChartTimeTodayHours'), {
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

    this.myChartTimDaysOfTheWeek = new Chart(this.getById('myChartTimDaysOfTheWeek'), {
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

    this.myChartTimeTodayMinutes = new Chart(this.getById('myChartTimeTodayMinutes'), {
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
