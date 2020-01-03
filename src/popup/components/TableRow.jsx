import React, { Component } from 'react';
import { LazyGroup } from 'react-lazy';
import Loader from 'react-loader-spinner';
import { uid } from 'react-uid';
import PropTypes from 'prop-types';
import DataProcessing from '../../js/DataProcessing';
import Color from '../../js/Color';

export default class TableRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showImageLoader: true,
    };

    this.defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');
    this.loaderColor = new Color('primary');

    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleImageError = this.handleImageError.bind(this);
    this.renderFaviconCell = this.renderFaviconCell.bind(this);
  }

  handleImageLoad() {
    this.setState({
      showImageLoader: false,
    });
  }

  handleImageError(e) {
    e.target.src = this.defaultFavUrl;

    this.handleImageLoad();
  }

  shortenText(text) {
    return text.replace(/(.{27})..+/, '$1...');
  }

  renderFaviconCell(faviconUrl, index) {
    const { showImageLoader } = this.state;

    return (
      <td className="favicon-cell">
        {faviconUrl ? (
          <LazyGroup cushion="200px">
            <img
              className="favicon-image"
              onError={this.handleImageError}
              onLoad={this.handleImageLoad}
              src={faviconUrl}
            />
            {showImageLoader && index > 5 && (
              <Loader type="Oval" color={this.loaderColor.color} width={16} height={16} />
            )}
          </LazyGroup>
        ) : (
          <img className="favicon-image" src={this.defaultFavUrl} />
        )}
      </td>
    );
  }

  renderButtonRow() {
    const { tableRowData } = this.props;

    return (
      <tr key={uid(tableRowData)} className="show-more-row">
        <td className="show-more-cell text-center" colSpan="4">
          <button className="show-more-btn" onClick={tableRowData.handleOnClick}>
            {tableRowData.name}
          </button>
        </td>
      </tr>
    );
  }

  render() {
    const { tableRowData, index, hoveredChartItem } = this.props;

    if (tableRowData.type === 'button') {
      return this.renderButtonRow();
    }

    const shortenName = tableRowData.name && this.shortenText(tableRowData.name);
    const parsedTime = tableRowData.time && DataProcessing.parseSecondsIntoTime(tableRowData.time);
    const isActive = hoveredChartItem === tableRowData.name;

    return (
      <tr key={uid(tableRowData)} className={isActive ? 'active' : ''}>
        <td className="index-cell" data-hover-text={index}>
          {index}
        </td>
        {this.renderFaviconCell(tableRowData.faviconUrl, index)}
        <td data-hover-text={index < 10 && shortenName}>
          <span>{shortenName}</span>
        </td>
        <td className="text-right" data-hover-text={parsedTime}>
          <span>{parsedTime}</span>
        </td>
      </tr>
    );
  }
}

TableRow.propTypes = {
  tableRowData: PropTypes.object.isRequired,
  index: PropTypes.number,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
};
