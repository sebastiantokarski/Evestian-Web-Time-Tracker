import React from 'react';
import config from 'js/config';
import { getDateString } from 'js/utils';
import DataProcessing from 'js/DataProcessing';

export default function MiniInfo() {
  const parseFirstVisit = (firstDate: string): string => {
    const currDate = getDateString();
    const getYear = (date: string): string => {
      return date.match(/-\d{4}/)[0];
    };
    const parseDate = (date: string) => {
      let month = date.match(/^\d{2}-(\d{2})-/)[1];
      const modDate = date.replace(/-\d{2}-\d{4}$/, '');

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

      return `${modDate} ${month}`;
    };

    if (firstDate === currDate) {
      return 'today';
    }

    if (getYear(firstDate) === getYear(currDate)) {
      return `since ${parseDate(firstDate)}`;
    }

    return `since ${firstDate}`;
  };

  const renderMiniInfo = () => {
    const dataProcessing = new DataProcessing(config.EXTENSION_DATA_NAME);

    dataProcessing.processGeneralData();

    return (
      <span className="mini-info__content">
        You spent {dataProcessing.totalTime}
        on {dataProcessing.totalDomains}
        {dataProcessing.totalDomains > 1 ? 'sites ' : 'site '}
        {parseFirstVisit(dataProcessing.firstVisit)}
      </span>
    );
  };

  return (
    <div className="mini-info__section">
      <div className="container">
        <div className="mini-info__wrapper">{renderMiniInfo()}</div>
      </div>
    </div>
  );
}
