import React from 'react';
import TableFaviconCell from './TableFaviconCell';
import DataProcessing from '../../../js/DataProcessing';

export interface TableRowData {
  name: string;
  time: number;
  faviconUrl?: string;
}

export interface TableRowProps extends TableRowData {
  name: string;
  time: number;
  index: number;
  faviconUrl?: string;
  hoveredChartItem?: string;
}

export default function TableRow({
  name,
  time,
  index,
  faviconUrl,
  hoveredChartItem,
}: TableRowProps) {
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
}
