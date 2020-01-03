import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Chart, Doughnut } from 'react-chartjs-2';
import DataProcessing from '../../js/DataProcessing';

export default class ChartDoughnut extends Component {
  constructor(props) {
    super(props);

    this.chartInstance = null;
    this.lastHoveredItemIndex = null;
  }

  registerChartPlugin() {
    Chart.pluginService.register({
      beforeDraw: function(chart) {
        if (chart && chart.options && chart.options.customTextInside) {
          const bottomCorner = chart.chartArea.bottom;
          const rightCorner = chart.chartArea.right;
          const ctx = chart.chart.ctx;
          const texts = chart.options.customTextInside.split('\n');
          const fontSize = texts.length === 1 ? 24 : 20;

          ctx.restore();
          ctx.font = `${fontSize}px Courier sans-serif`;
          ctx.textBaseline = 'middle';

          for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            const textX = Math.round((rightCorner - ctx.measureText(text).width) / 2);
            const textY = bottomCorner / 2 + (i + 1) * 24 - (texts.length + 1) * 12;

            ctx.fillText(text, textX, textY);
            ctx.save();
          }
        }
      },
    });
  }

  parseArrayOfSecondsToTimeString(array) {
    return DataProcessing.parseSecondsIntoTime(DataProcessing.sum(array));
  }

  /**
   * @param {string} text
   * @param {number} [maxLength=20]
   * @return {string}
   */
  getShortenText(text, maxLength = 20) {
    const regex = new RegExp(`(.{${maxLength}})..+`);

    text = text.replace(regex, '$1...');

    if (text.slice(-4) === '....') {
      text = text.slice(0, -1);
    }

    return text;
  }

  onChartHover(chartData, event, items) {
    const chart = this.chartInstance.chartInstance;
    const hoveredItemIndex = items.length ? items[0]._index : null;
    const shouldProceed = () => {
      return hoveredItemIndex !== this.lastHoveredItemIndex;
    };

    if (!shouldProceed()) {
      return;
    }

    let hoveredItemName = null;
    let customTextInside = null;

    if (hoveredItemIndex !== null) {
      const chartDataset = chart.data.datasets[0];
      const itemDataInSeconds = chartDataset.data[hoveredItemIndex];
      const text = DataProcessing.parseSecondsIntoTime(itemDataInSeconds);
      const percentage = ((itemDataInSeconds / DataProcessing.sum(chartData.data)) * 100).toFixed(
        2
      );

      hoveredItemName = this.props.chartData.labels[hoveredItemIndex];

      const shortenName = this.getShortenText(hoveredItemName, 17);

      customTextInside = `${text}\n${shortenName}\n${percentage}%`;
    } else {
      customTextInside = this.parseArrayOfSecondsToTimeString(chartData.data);
    }

    this.lastHoveredItemIndex = hoveredItemIndex;
    this.props.handleChartHover(this.props.chartTable, hoveredItemName);

    chart.options.customTextInside = customTextInside;
    chart.update();
  }

  componentWillMount() {
    this.registerChartPlugin();
  }

  render() {
    if (!this.props.renderOnLoad || !this.props.chartData) {
      return null;
    }

    const chartOptions = {
      maintainAspectRatio: false,
      cutoutPercentage: 58,
      customTextInside: this.parseArrayOfSecondsToTimeString(this.props.chartData.data),
      tooltips: {
        enabled: false,
      },
      legend: {
        display: false,
      },
      animation: {
        animateScale: true,
      },
      hover: {
        onHover: this.onChartHover.bind(this, this.props.chartData),
      },
    };
    const chartData = {
      datasets: [
        {
          data: this.props.chartData.data,
          backgroundColor: this.props.chartData.colors,
        },
      ],
    };

    return (
      <section className={`chart-doughnut__section`}>
        <div className="chart-doughnut__container">
          <Doughnut
            ref={ref => (this.chartInstance = ref)}
            data={chartData}
            options={chartOptions}
          />
        </div>
      </section>
    );
  }
}

ChartDoughnut.propTypes = {
  chartData: PropTypes.object,
  chartTable: PropTypes.string,
  renderOnLoad: PropTypes.bool,
  handleChartHover: PropTypes.func,
};
