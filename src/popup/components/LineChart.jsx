import React, {Component} from 'react';

export default class Footer extends Component {
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
