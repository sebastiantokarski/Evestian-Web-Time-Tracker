import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class LineChart extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <section className="lineChart__section">
        <div className="container">
          <h5 className="lineChart__title">{this.props.chartTitle}</h5>
          <canvas id={this.props.chartName}></canvas>
        </div>
      </section>
    );
  }
}

LineChart.propTypes = {
  chartTitle: PropTypes.string,
  chartName: PropTypes.string,
};
