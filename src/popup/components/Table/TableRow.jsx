import React from 'react';
import PropTypes from 'prop-types';
import DataProcessing from '../../../js/DataProcessing';
import TableFaviconCell from './TableFaviconCell.jsx';

const TableRow = ({ name, time, faviconUrl, hoveredChartItem, index }) => {
  const isActive = hoveredChartItem === name;

  const shortenText = (text) => {
    return text.replace(/(.{27})..+/, '$1...');
  };

  const shortenName = shortenText(name);
  const parsedTime = DataProcessing.parseSecondsIntoTime(time);

  return (
    <tr key={`${index}-${name}`} className={isActive ? 'active' : ''}>
      <td className="index-cell" data-hover-text={index}>
        {index}
      </td>
      <TableFaviconCell faviconUrl={faviconUrl} index={index} />
      <td data-hover-text={index < 10 && shortenName}>
        <span>{shortenName}</span>
      </td>
      <td className="text-right" data-hover-text={parsedTime}>
        <span>{parsedTime}</span>
      </td>
    </tr>
  );
};

TableRow.propTypes = {
  name: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  faviconUrl: PropTypes.string,
  index: PropTypes.number,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
};

export default TableRow;
