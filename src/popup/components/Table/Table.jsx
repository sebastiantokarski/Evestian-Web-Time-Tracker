import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TableRow from './TableRow.jsx';
import TableShowMoreBtn from './TableShowMoreBtn.jsx';

const Table = ({ className, tableData, hoveredChartItem, striped, hovered, rowLimit = 10 }) => {
  const [numOfRowsToShow, setNumOfRowsToShow] = useState(rowLimit);

  const getTableClassNames = (additionalClassName) => {
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
      (time, currData, index) => (index > numOfRowsToShow ? time + currData.time : time),
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
};

Table.propTypes = {
  striped: PropTypes.bool,
  hovered: PropTypes.bool,
  tableData: PropTypes.array,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
  rowLimit: PropTypes.number,
  className: PropTypes.string,
};

export default Table;
