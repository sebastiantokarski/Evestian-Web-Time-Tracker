import React, { Component } from 'react';
import { Lazy } from 'react-lazy';
import PropTypes from 'prop-types';
import DataProcessing from '../../js/DataProcessing';

export default class Table extends Component {
  constructor(props) {
    super(props);

    this.defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');

    this.handleImageError = this.handleImageError.bind(this);
  }

  handleImageError(e) {
    e.target.src = this.defaultFavUrl;
  }

  getDefaultFavicon() {
    return <img src={ this.defaultFavUrl } />;
  }

  renderTableBody() {
    let itemIndex;
    let itemName;
    let itemFavicon;
    let itemTime;

    return this.props.tableData.map((item, index) => {
      itemIndex = index + 1;
      itemName = item[0].replace(/(.{30})..+/, '$1...');
      itemFavicon = item[2] ? item[2] : this.defaultFavUrl;
      itemTime = DataProcessing.parseSecondsIntoTime(item[1]);

      return (
        <tr key={ itemIndex } className={ this.props.hoveredChartItem === item[0] ? 'active' : '' }>
          <td>{ itemIndex }</td>
          <td>
            <Lazy onError={ this.handleImageError }>
              <img className="favImage" src={ itemFavicon } />
            </Lazy>
          </td>
          <td><span>{ itemName }</span></td>
          <td className="spentTimeCell"><span>{ itemTime }</span></td>
        </tr>
      );
    });
  }

  render() {
    if (!this.props.tableData) {
      return null;
    }

    return (
      <table className={ `table${ this.props.striped ? ' table-striped' : '' }` }>
        <tbody>{ this.renderTableBody() }</tbody>
      </table>
    );
  }
}

Table.propTypes = {
  striped: PropTypes.bool,
  tableData: PropTypes.array,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
};
