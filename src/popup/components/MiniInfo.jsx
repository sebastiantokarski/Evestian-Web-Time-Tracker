import React, { Component } from 'react';
import config from '../../js/config';
import DataProcessing from '../../js/DataProcessing';

export default class MiniInfo extends Component {
  constructor(props) {
    super(props);
  }

  renderMiniInfo() {
    const dataProcessing = new DataProcessing(config.EXTENSION_DATA_NAME);

    dataProcessing.processGeneralData();

    return (
      <span className="mini-info__content">
        You spent { dataProcessing.totalTime + ' '}
        on { dataProcessing.totalDomains + ' '}
        sites since { dataProcessing.firstVisit }
      </span>
    );
  }

  render() {
    return (
      <div className="mini-info__section">
        <div className="container">
          <div className="mini-info__wrapper">
            { this.renderMiniInfo() }
          </div>
        </div>
      </div>
    );
  }
}
