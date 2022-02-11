import React from 'react';
import DataProcessing from '../../../js/DataProcessing';
import TableFaviconCell from './TableFaviconCell';

export interface TableRowProps {
  name: string;
  time: number;
  index: number;
  faviconUrl?: string;
  hoveredChartItem?: string;
}

const TableRow: React.FC<TableRowProps> = ({ name, time, index, faviconUrl, hoveredChartItem }) => {
  const isActive = hoveredChartItem === name;

  const shortenText = (text: string): string => {
    return text.replace(/(.{27})..+/, '$1...');
  };

  const shortenName = shortenText(name);
  const parsedTime = DataProcessing.parseSecondsIntoTime(time);

  return (
    <tr className={isActive ? 'active' : ''}>
      <td className="index-cell">{index}</td>
      <TableFaviconCell faviconUrl={faviconUrl} />
      <td data-hover-text={index < 10 && shortenName}>
        <span>{shortenName}</span>
      </td>
      <td className="text-right" data-hover-text={parsedTime}>
        <span>{parsedTime}</span>
      </td>
    </tr>
  );
};

export default TableRow;
