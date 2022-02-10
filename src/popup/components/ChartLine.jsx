import Chart from 'chart.js/auto';
import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import Color from '../../js/Color';

export default class ChartLine extends Component {
  constructor(props) {
    super(props);

    this.chartFirstColorBorder = new Color('primary').toRGBa(0.65);
    this.chartFirstColorBackground = new Color('primaryLight').toRGBa(0.65);
    this.chartSecondColorBorder = new Color('secondaryDark').toRGBa(0.65);
    this.chartSecondColorBackground = new Color('secondary').toRGBa(0.65);
  }

  registerChartPlugin() {
    Chart.register({
      id: 'paddingBelowLegends',
      beforeInit: function (chart) {
        if (chart.config.type !== 'line') {
          return;
        }
        chart.legend.afterFit = function () {
          this.height += 10;
        };
      },
    });
  }

  componentWillMount() {
    this.registerChartPlugin();
  }

  render() {
    if (!this.props.chartData1 || !this.props.chartData2) {
      return null;
    }
    return (
      <section className="lineChart__section">
        <div className="container">
          <h5 className="lineChart__title">{this.props.chartTitle}</h5>
          <Line
            data={{
              datasets: [
                {
                  yAxisID: 'Today',
                  label: 'Today in minutes',
                  data: this.props.chartData1.data,
                  borderColor: this.chartFirstColorBorder,
                  backgroundColor: this.chartFirstColorBackground,
                  pointStyle: 'circle',
                },
                {
                  yAxisID: 'Global',
                  label: 'Global in minutes',
                  data: this.props.chartData2.data,
                  borderColor: this.chartSecondColorBorder,
                  backgroundColor: this.chartSecondColorBackground,
                  pointStyle: 'circle',
                },
              ],
              labels: this.props.chartData2.labels,
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                Today: {
                  position: 'left',
                  type: 'linear',
                  ticks: {
                    suggestedMin: 0,
                    suggestedMax: 60,
                  },
                },
                Global: {
                  position: 'right',
                  type: 'linear',
                  ticks: {
                    suggestedMin: 0,
                    suggestedMax: 60,
                  },
                },
                // yAxes: [
                //   {
                //     id: 'Today',
                //     position: 'left',
                //     type: 'linear',
                //     ticks: {
                //       suggestedMin: 0,
                //       suggestedMax: 60,
                //     },
                //   },
                //   {
                //     id: 'Global',
                //     position: 'right',
                //     type: 'linear',
                //     ticks: {
                //       suggestedMin: 0,
                //       suggestedMax: 60,
                //     },
                //   },
                // ],
              },
              legend: {
                labels: {
                  usePointStyle: true,
                },
              },
            }}
          />
        </div>
      </section>
    );
  }
}

ChartLine.propTypes = {
  chartTitle: PropTypes.string,
  chartData1: PropTypes.object,
  chartData2: PropTypes.object,
};
