import React, { Component } from 'react';
import { LazyGroup } from 'react-lazy';
import PropTypes from 'prop-types';
import DataProcessing from '../../js/DataProcessing';
import Loader from 'react-loader-spinner';
import Color from '../../js/Color';

export default class TableRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageLoader: true,
    };

    this.defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');
    this.loaderColor = new Color('primary');

    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleImageError = this.handleImageError.bind(this);
  }

  handleImageLoad() {
    this.setState({
      imageLoader: false,
    });
  }

  handleImageError(e) {
    e.target.src = this.defaultFavUrl;

    this.handleImageLoad();
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
        <td className="index-cell" data-hover-text={ tableRowIndex }>{ tableRowIndex }</td>
        <td className="favicon-cell">
          <LazyGroup
            cushion="200px">
            <img
              className="favicon-image"
              onError={ this.handleImageError }
              onLoad={ this.handleImageLoad }
              src={ faviconUrl } />
            { this.state.imageLoader &&
              <Loader
                type="Oval"
                color={ this.loaderColor.color }
                width={ 16 }
                height={ 16 } /> }
          </LazyGroup>
        </td>
        <td data-hover-text={ tableRowIndex < 10 && shortenName }><span>{ shortenName }</span></td>
        <td className="text-right" data-hover-text={ parsedTime }><span>{ parsedTime }</span></td>
      </tr>
    );
  }
}

TableRow.propTypes = {
  tableRowData: PropTypes.object.isRequired,
  index: PropTypes.number,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
};
