import '@babel/polyfill';
import config from '../js/config';
import utils from '../js/utils';
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
    this.dataFromBackground = chrome.extension.getBackgroundPage().data;
    this.dataProcessing = new DataProcessing(dataName, this.dataFromBackground.data);
  }

  /**
   * Set custom chart.js methods.
   */
  setCustomChartMethods() {
    Chart.pluginService.register({
      beforeDraw: function(chart) {
        if (chart && chart.options && chart.options.customTextInside) {
          const bottomCorner = chart.chartArea.bottom;
          const rightCorner = chart.chartArea.right;
          const ctx = chart.chart.ctx;

          ctx.restore();
          ctx.font = '20px sans-serif';
          ctx.textBaseline = 'middle';

          const texts = chart.options.customTextInside.split('\n');

          for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            const textX = Math.round((rightCorner - ctx.measureText(text).width) / 2);
            const textY = i == 0 ? bottomCorner / 2 : bottomCorner / 2 + (i * 22);

            ctx.fillText(text, textX, textY);
            ctx.save();
          }
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
      const itemDataInSeconds = chartDataset.data[itemIndex];
      const text = DataProcessing.parseSecondsIntoTime(itemDataInSeconds);
      const percentage = (itemDataInSeconds / this.dataProcessing[dataName].data.reduce((a, b) => a + b, 0) * 100).toFixed(2);

      chart.options.customTextInside = `${text}\n${percentage}%`;
      chart.update();
    } else {
      const customTextInside = this.parseTextInsideChart(this.dataProcessing[dataName]);

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
    const totalDomainsNode = document.getElementById('totalDomains');
    const totalTimeNode = document.getElementById('totalTime');

    utils.debugLog('Generated data:', this.dataProcessing);

    this.dataProcessing.processGeneralData();
    this.dataProcessing.processFirstDoughnutData();

    totalTimeNode.textContent = this.dataProcessing.alltime;
    // @todo this -2 is so mysteroius
    totalDomainsNode.textContent = Object.keys(this.dataProcessing.data).length - 2;

    this.generateFirstDoughnutChart();
    this.generateTables();
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

    this.generateTable(todayTable, this.dataProcessing.pagesVisitedTodayArrayData);
    // this.generateTable(yesterdayTable, this.dataProcessing.pagesVisitedYesterdayArrayData);
    // this.generateTable(thisMonthTable, this.dataProcessing.pagesVisitedThisMonthArrayData);
    // this.generateTable(lastMonthTable, this.dataProcessing.pagesVisitedLastMonthArrayData);
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

  generateFirstDoughnutChart() {
    this.todayChart = new Chart(this.getById('myChartToday'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.dataProcessing.pagesVisitedToday.data,
          backgroundColor: this.dataProcessing.pagesVisitedToday.colors,
        }],
        labels: this.dataProcessing.pagesVisitedToday.labels.map((label) => {
          return label.length > 24 ? label.slice(0, 24) + '...' : label;
        }),
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.dataProcessing.pagesVisitedToday),
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
  }

  generateDoughnutsCharts() {
    this.yesterdayChart = new Chart(this.getById('myChartYesterday'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.dataProcessing.pagesVisitedYesterday.data,
          backgroundColor: this.dataProcessing.pagesVisitedYesterday.colors,
        }],
        labels: this.dataProcessing.pagesVisitedYesterday.labels,
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.dataProcessing.pagesVisitedYesterday),
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
          data: this.dataProcessing.pagesVisitedThisMonth.data,
          backgroundColor: this.dataProcessing.pagesVisitedThisMonth.colors,
        }],
        labels: this.dataProcessing.pagesVisitedThisMonth.labels,
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.dataProcessing.pagesVisitedThisMonth),
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
          data: this.dataProcessing.pagesVisitedLastMonth.data,
          backgroundColor: this.dataProcessing.pagesVisitedLastMonth.colors,
        }],
        labels: this.dataProcessing.pagesVisitedLastMonth.labels,
      },
      options: {
        cutoutPercentage: 58,
        maintainAspectRatio: false,
        customTextInside: this.parseTextInsideChart(this.dataProcessing.pagesVisitedLastMonth),
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
  }

  /**
   * Generate all charts.
   */
  generateCharts() {
    this.myChartTimeTodayHours = new Chart(this.getById('myChartTimeTodayHours'), {
      type: 'line',
      data: {
        datasets: [{
          yAxisID: 'Today',
          label: 'Time in minutes Today',
          data: this.dataProcessing.timeSpentInHours.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }, {
          yAxisID: 'Global',
          label: 'Time in minutes Global',
          data: this.dataProcessing.timeSpentInHoursTotal.data,
          borderColor: 'rgb(243, 26, 11)',
          backgroundColor: 'rgb(249, 106, 95)',
        }],
        labels: this.dataProcessing.timeSpentInHoursTotal.labels,
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
          data: this.dataProcessing.timeSpentEachDayOfTheWeek.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }, {
          yAxisID: 'Global',
          label: 'Time in minutes total',
          data: this.dataProcessing.timeSpentEachDayOfTheWeekTotal.data,
          borderColor: 'rgb(243, 26, 11)',
          backgroundColor: 'rgb(249, 106, 95)',
        }],
        labels: this.dataProcessing.timeSpentEachDayOfTheWeekTotal.labels,
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
          data: this.dataProcessing.timeSpentInMinutes.data,
          borderColor: 'rgb(0, 102, 255)',
          backgroundColor: 'rgb(77, 148, 255)',
        }],
        labels: this.dataProcessing.timeSpentInMinutes.labels,
      },
    });
  }
}
const popup = new Popup(config.EXTENSION_DATA_NAME);

popup.init();
