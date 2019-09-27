import React, { Component } from 'react';
import { LazyGroup } from 'react-lazy';
import PropTypes from 'prop-types';
import DataProcessing from '../../js/DataProcessing';
import Loader from 'react-loader-spinner';
import { uid } from 'react-uid';
import Color from '../../js/Color';

export default class TableRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      setImageLoader: true,
    };

    this.defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');
    this.loaderColor = new Color('primary');

    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleImageError = this.handleImageError.bind(this);
  }

  handleImageLoad() {
    this.setState({
      setImageLoader: false,
    });
  }

  handleImageError(e) {
    e.target.src = this.defaultFavUrl;

    this.handleImageLoad();
  }

  shortenText(text) {
    return text.replace(/(.{27})..+/, '$1...');
  }

  renderButtonRow() {
    const { tableRowData } = this.props;

    return (
      <tr key={uid(tableRowData)} className="show-more-row">
        <td className="show-more-cell text-center" colSpan="4">
          <button
            className="show-more-btn"
            onClick={tableRowData.handleOnClick}
          >{tableRowData.name}</button>
        </td>
      </tr>
    );
  }

  render() {
    const { tableRowData, index, hoveredChartItem } = this.props;
    const { setImageLoader } = this.state;

    if (tableRowData.type === 'button') {
      return this.renderButtonRow();
    }

    const shortenName = tableRowData.name && this.shortenText(tableRowData.name);
    const faviconUrl = tableRowData.faviconUrl ? tableRowData.faviconUrl : this.defaultFavUrl;
    const parsedTime = tableRowData.time && DataProcessing.parseSecondsIntoTime(tableRowData.time);
    const isActive = hoveredChartItem === tableRowData.name;

    return (
      <tr key={uid(tableRowData)} className={isActive ? 'active' : ''}>
        <td className="index-cell" data-hover-text={index}>{index}</td>
        <td className="favicon-cell">
          <LazyGroup cushion="200px">
            <img
              className="favicon-image"
              onError={this.handleImageError}
              onLoad={this.handleImageLoad}
              src={faviconUrl}
            />
            {setImageLoader && (
              <Loader
                type="Oval"
                color={this.loaderColor.color}
                width={16}
                height={16}
              />
            )}
          </LazyGroup>
        </td>
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
