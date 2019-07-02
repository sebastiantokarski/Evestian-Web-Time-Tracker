import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Chart, Doughnut} from 'react-chartjs-2';
import DataProcessing from '../../js/DataProcessing';

export default class DoughnutChart extends Component {
  constructor(props) {
    super(props);
    this.chartInstance = null;
  }

  componentWillMount() {
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

  parseTextInsideChart(data) {
    return DataProcessing.parseSecondsIntoTime(data.data.reduce((a, b) => a + b, 0));
  }

  onChartHover(chartData, event, items) {
    const chart = this.chartInstance.chartInstance;

    if (event.layerY > chart.chartArea.bottom) {
      return;
    }

    if (items.length) {
      const itemIndex = items[0]._index;
      const chartDataset = chart.data.datasets[0];
      const itemDataInSeconds = chartDataset.data[itemIndex];
      const text = DataProcessing.parseSecondsIntoTime(itemDataInSeconds);
      const percentage = (itemDataInSeconds / chartData.data.reduce((a, b) => a + b, 0) * 100).toFixed(2);

      chart.options.customTextInside = `${text}\n${percentage}%`;
      chart.update();
    } else {
      const customTextInside = this.parseTextInsideChart(chartData);

      if (chart.options.customTextInside !== customTextInside) {
        chart.options.customTextInside = customTextInside;
        chart.update();
      }
    }
  }

  render() {
    return this.props.renderOnLoad ? (
      <section className={`chart-doughnut__section`}>
        <div className="chart-doughnut__container">
          <Doughnut
            ref={(ref) => this.chartInstance = ref }
            data={ {
              datasets: [{
                data: this.props.chartData.data,
                backgroundColor: this.props.chartData.colors,
              }],
              labels: this.props.chartData.labels.map((label) => {
                return label.length > 24 ? label.slice(0, 24) + '...' : label;
              }),
            } } options = {{
              cutoutPercentage: 58,
              maintainAspectRatio: false,
              customTextInside: this.parseTextInsideChart(this.props.chartData),
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
                onHover: this.onChartHover.bind(this, this.props.chartData),
              },
              animation: {
                animateScale: true,
              },
              legend: {
                display: false,
              },
            } } />
        </div>
      </section>
    ) : null;
  }
}

Doughnut.propTypes = {
  chartData: PropTypes.object,
  chartName: PropTypes.string,
  renderOnLoad: PropTypes.bool,
};

