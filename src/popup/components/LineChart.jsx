import React, { Component } from 'react';
import { Chart, Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';

export default class LineChart extends Component {
  constructor(props) {
    super(props);
  }

  registerChartPlugin() {
    Chart.plugins.register({
      id: 'paddingBelowLegends',
      beforeInit: function(chart) {
        if (chart.config.type !== 'line') {
          return;
        }
        chart.legend.afterFit = function() {
          this.height += 10;
        };
      },
    });
  }

  componentWillMount() {
    this.registerChartPlugin();
  }

  render() {
    return (
      <section className="lineChart__section">
        <div className="container">
          <h5 className="lineChart__title">{this.props.chartTitle}</h5>
          <Line
            data={ {
              datasets: [{
                yAxisID: 'Today',
                // @todo Those labels should be parameterized
                label: 'Time in minutes Today',
                data: this.props.chartData1.data,
                borderColor: 'rgb(0, 102, 255)',
                backgroundColor: 'rgb(77, 148, 255, .65)',
              }, {
                yAxisID: 'Global',
                label: 'Time in minutes Global',
                data: this.props.chartData2.data,
                borderColor: 'rgb(243, 26, 11)',
                backgroundColor: 'rgba(249, 106, 95, .65)',
              }],
              labels: this.props.chartData2.labels,
            } }
            options={ {
              maintainAspectRatio: false,
              scales: {
                yAxes: [{
                  id: 'Today',
                  position: 'left',
                  type: 'linear',
                  ticks: {
                    suggestedMin: 0,
                    suggestedMax: 60,
                  },
                }, {
                  id: 'Global',
                  position: 'right',
                  type: 'linear',
                }],
              },
            } } />
        </div>
      </section>
    );
  }
}

LineChart.propTypes = {
  chartTitle: PropTypes.string,
  chartData1: PropTypes.object,
  chartData2: PropTypes.object,
};
