import React, { useState } from 'react';
import TableRow, { TableRowData } from './TableRow';
import TableShowMoreBtn from './TableShowMoreBtn';

export interface TableProps {
  striped: boolean;
  hovered: boolean;
  tableData: TableRowData[];
  hoveredChartItem?: string;
  rowLimit: number;
  className?: string;
}

export default function Table({
  tableData,
  hoveredChartItem,
  striped,
  hovered,
  rowLimit = 10,
  className = '',
}: TableProps) {
  const [numOfRowsToShow, setNumOfRowsToShow] = useState(rowLimit);

  const getTableClassNames = (additionalClassName: string): string => {
    const classNames = ['table'];

    if (striped) {
      classNames.push('table-striped');
    } else if (hovered) {
      classNames.push('table-hovered');
    } else if (additionalClassName) {
      classNames.push(additionalClassName);
    }

    return classNames.join(' ');
  };

  const renderTableRow = (tableRowData, index) => {
    const { name, time, faviconUrl } = tableRowData;

    return (
      <TableRow
        key={`${index}-${name}`}
        name={name}
        time={time}
        faviconUrl={faviconUrl}
        index={index + 1}
        hoveredChartItem={hoveredChartItem}
      />
    );
  };

  const handleShowMoreClick = () => {
    setNumOfRowsToShow(tableData.length);
  };

  const getOthersTime = () => {
    return tableData.reduce(
      (time: number, currData, index: number) =>
        index > numOfRowsToShow ? time + currData.time : time,
      0
    );
  };

  return (
    <table className={getTableClassNames(className)}>
      <tbody>
        {tableData.slice(0, numOfRowsToShow).map(renderTableRow)}
        {numOfRowsToShow < tableData.length && (
          <>
            <TableRow name="Others" time={getOthersTime()} index={numOfRowsToShow + 1} />
            <TableShowMoreBtn handleClick={handleShowMoreClick} />
          </>
        )}
      </tbody>
    </table>
  );
}
