import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';

export default class LineChart extends Component {
  constructor(props) {
    super(props);
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
                label: 'Time in minutes Today',
                data: this.props.chartData1.data,
                borderColor: 'rgb(0, 102, 255)',
                backgroundColor: 'rgb(77, 148, 255)',
              }, {
                yAxisID: 'Global',
                label: 'Time in minutes Global',
                data: this.props.chartData2.data,
                borderColor: 'rgb(243, 26, 11)',
                backgroundColor: 'rgb(249, 106, 95)',
              }],
              labels: this.props.chartData2.labels,
            } }
            options={ {
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
