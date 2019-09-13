import React, { Component } from 'react';
import { Lazy } from 'react-lazy';
import PropTypes from 'prop-types';
import DataProcessing from '../../js/DataProcessing';

export default class TableRow extends Component {
  constructor(props) {
    super(props);

    this.defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');

    this.handleImageError = this.handleImageError.bind(this);
  }

  handleImageError(e) {
    e.target.src = this.defaultFavUrl;
  }

  render() {
    const tableRowData = this.props.tableRowData;
    const tableRowIndex = this.props.index + 1;
    const shortenName = tableRowData.name && tableRowData.name.replace(/(.{27})..+/, '$1...');
    const faviconUrl = tableRowData.faviconUrl ? tableRowData.faviconUrl : this.defaultFavUrl;
    const parsedTime = tableRowData.time && DataProcessing.parseSecondsIntoTime(tableRowData.time);
    const isActive = this.props.hoveredChartItem === tableRowData.name ? 'active' : '';

    return (
      <tr key={ tableRowIndex } className={ isActive }>
        <td data-hover-text={ tableRowIndex }>{ tableRowIndex }</td>
        <td>
          <Lazy onError={ this.handleImageError }>
            <img className="favImage" src={ faviconUrl } />
          </Lazy>
        </td>
        <td data-hover-text={ tableRowIndex < 10 && shortenName }><span>{ shortenName }</span></td>
        <td data-hover-text={ parsedTime }><span>{ parsedTime }</span></td>
      </tr>
    );
  }
}

TableRow.propTypes = {
  tableRowData: PropTypes.object.isRequired,
  index: PropTypes.number,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
};
