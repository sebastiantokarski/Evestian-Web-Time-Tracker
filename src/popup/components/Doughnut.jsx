import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Doughnut extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section className={`chart-doughnut--${this.props.chartName}`}>
        <h3 className="chart-doughnut__title">{this.props.chartTitle}</h3>
        <div className="chart-doughnut__container">
          <canvas id={this.props.chartName}></canvas>
        </div>
      </section>
    );
  }
}

Doughnut.propTypes = {
  chartTitle: PropTypes.string,
  chartName: PropTypes.string,
};

