import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import TableRow from './TableRow.jsx';

export default class Table extends Component {
  constructor(props) {
    super(props);

    this.defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');

    const { rowLimit, tableData } = this.props;

    this.state = {
      numberOfRowsToShow: rowLimit,
      renderShowMoreBtn: tableData.length > rowLimit,
    };

    this.showMoreRows = this.showMoreRows.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { rowLimit, tableData } = this.props;

    if (tableData.length && prevProps.tableData !== tableData) {
      this.setState({
        renderShowMoreBtn: tableData.length > rowLimit,
      });
    }
  }

  renderTableRow(tableRowData, index) {
    const { hoveredChartItem } = this.props;

    return (
      <TableRow
        tableRowData={tableRowData}
        index={index + 1}
        hoveredChartItem={hoveredChartItem}
      />
    );
  }

  renderOthersRow(othersTime) {
    if (othersTime) {
      return this.renderTableRow({
        name: 'Other',
        time: othersTime,
      },
      this.state.numberOfRowsToShow - 1
      );
    }
    return null;
  }

  renderShowMoreRow(othersTime) {
    if (othersTime) {
      return this.renderTableRow({
        name: 'Show more',
        type: 'button',
        handleOnClick: this.showMoreRows,
      });
    }

    return null;
  }

  showMoreRows() {
    this.setState({
      // + 1 because we don't count '0'
      numberOfRowsToShow: this.props.tableData.length + 1,
      renderShowMoreBtn: false,
    });
  }

  renderTableBody() {
    let othersTime = 0;
    const filterFirstRows = ({ time }, index) => {
      const rIndex = index + 1;

      if (rIndex < this.state.numberOfRowsToShow) {
        return true;
      }
      othersTime += time;
      return false;
    };

    const tableRows = this.props.tableData
        .filter(filterFirstRows)
        .map(this.renderTableRow.bind(this));

    const othersRow = this.renderOthersRow(othersTime);
    const showMoreRow = this.renderShowMoreRow(othersTime);

    return (
      <Fragment>
        {tableRows}
        {othersRow}
        {this.state.renderShowMoreBtn && showMoreRow}
      </Fragment>
    );
  }

  getTableClasses(additionalClass) {
    const { striped, hovered } = this.props;
    const classes = ['table'];

    if (striped) {
      classes.push('table-striped');
    } else if (hovered) {
      classes.push('table-hovered');
    } else if (additionalClass) {
      classes.push(additionalClass);
    }

    return classes.join(' ');
  }

  render() {
    const { tableData, className } = this.props;

    if (!tableData.length) {
      return null;
    }

    return (
      <table className={this.getTableClasses(className)}>
        <tbody>{this.renderTableBody()}</tbody>
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
  className: PropTypes.string,
};
