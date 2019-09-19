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

  renderOthersRow(othersTime) {
    if (othersTime) {
      return this.renderTableRow({
        name: 'Other',
        faviconUrl: this.defaultFavUrl,
        time: othersTime,
      }, this.props.rowLimit - 1);
    }
    return null;
  }

  renderTableBody() {
    let othersTime = 0;
    const filterFirstRows = ({ time }, index) => {
      if (index + 1 < this.props.rowLimit) {
        return true;
      }
      othersTime += time;
      return false;
    };

    const tableRows = this.props.tableData
        .filter(filterFirstRows)
        .map(this.renderTableRow.bind(this));

    const othersRow = this.renderOthersRow(othersTime);

    return (
      <Fragment>
        { tableRows }
        { othersRow }
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
