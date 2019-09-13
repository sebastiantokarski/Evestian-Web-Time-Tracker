import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import TableRow from './TableRow.jsx';

export default class Table extends Component {
  constructor(props) {
    super(props);

    this.defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');
  }

  renderTableRow(tableRowData, index) {
    return <TableRow tableRowData={ tableRowData }
      index={ index }
      hoveredChartItem={ this.props.hoveredChartItem }
    />;
  }

  renderTableBody() {
    let lastRowTime = 0;
    const filterFirstRows = ({ time }, index) => {
      if (index + 1 < this.props.rowLimit) {
        return true;
      }
      lastRowTime += time;
      return false;
    };

    const tableRows = this.props.tableData
        .filter(filterFirstRows)
        .map(this.renderTableRow.bind(this));

    const lastTableRow = this.renderTableRow({
      name: 'Other',
      faviconUrl: this.defaultFavUrl,
      time: lastRowTime,
    }, this.props.rowLimit - 1);

    return (
      <Fragment>
        { tableRows }
        { lastTableRow }
      </Fragment>
    );
  }

  getTableClasses() {
    const classes = [];

    if (this.props.striped) {
      classes.push('table-striped');
    } else if (this.props.hovered) {
      classes.push('table-hovered');
    }

    return classes.join(' ');
  }

  render() {
    if (!this.props.tableData) {
      return null;
    }

    return (
      <table className={ `table ${ this.getTableClasses() }` }>
        <tbody>{ this.renderTableBody() }</tbody>
      </table>
    );
  }
}

Table.propTypes = {
  striped: PropTypes.bool,
  hovered: PropTypes.bool,
  tableData: PropTypes.array,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
  rowLimit: PropTypes.number,
};
