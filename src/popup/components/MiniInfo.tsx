import React from 'react';
import { format, formatDistance, parseISO } from 'date-fns';
import { STORAGE_DATA_KEY } from 'js/config';
import DataProcessing from 'js/DataProcessing';

export default function MiniInfo() {
  const renderMiniInfo = () => {
    const dataProcessing = new DataProcessing(STORAGE_DATA_KEY);

    const duration = (s: number) => formatDistance(0, s * 1000, { includeSeconds: true });

    return (
      <span className="mini-info__content">
        You spent {duration(dataProcessing.getTotalTime())} so far since{' '}
        {format(parseISO(dataProcessing.getFirstVisitDate()), 'MMMM dd')}
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
