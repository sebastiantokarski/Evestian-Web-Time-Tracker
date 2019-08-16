import React, { Component } from 'react';
import config from '../../js/config';
import DataProcessing from '../../js/DataProcessing';
import utils from '../../js/utils';

export default class MiniInfo extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * @param {string} date - DD-MM-YYYY.
   * @return {string}
   */
  parseFirstVisit(date) {
    const currDate = utils.getDateString();
    const getYear = (date) => {
      return date.match(/-\d{4}/)[0];
    };
    const parseDate = (date) => {
      let month = date.match(/^\d{2}-(\d{2})-/)[1];

      date = date.replace(/-\d{2}-\d{4}$/, '');

      month = month
          .replace('01', 'January')
          .replace('02', 'February')
          .replace('03', 'March')
          .replace('04', 'April')
          .replace('05', 'May')
          .replace('06', 'June')
          .replace('07', 'July')
          .replace('08', 'August')
          .replace('09', 'September')
          .replace('10', 'October')
          .replace('11', 'November')
          .replace('12', 'December');

      return `${date} ${month}`;
    };

    if (date === currDate) {
      return 'today';
    }

    if (getYear(date) === getYear(currDate)) {
      return `since ${parseDate(date)}`;
    }

    return `since ${date}`;
  }

  renderMiniInfo() {
    const dataProcessing = new DataProcessing(config.EXTENSION_DATA_NAME);

    dataProcessing.processGeneralData();

    return (
      <span className="mini-info__content">
        You spent { dataProcessing.totalTime + ' '}
        on { dataProcessing.totalDomains + ' '}
        { dataProcessing.totalDomains > 1 ? 'sites ' : 'site ' }
        { this.parseFirstVisit(dataProcessing.firstVisit) }
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
