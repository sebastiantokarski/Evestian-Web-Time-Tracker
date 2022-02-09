import React from 'react';
import { LazyGroup } from 'react-lazy';
import { Oval } from 'react-loader-spinner';
import { uid } from 'react-uid';
import PropTypes from 'prop-types';
import DataProcessing from '../../js/DataProcessing';
import Color from '../../js/Color';

const TableRow = ({ tableRowData, hoveredChartItem, index }) => {
  const defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');
  const loaderColor = new Color('primary');
  const isActive = hoveredChartItem === tableRowData.name;

  const [imageLoader, setImageLoader] = React.useState(true);

  const handleImageError = (e) => {
    e.target.src = defaultFavUrl;
    setImageLoader(false);
  };

  const handleImageLoad = () => {
    setImageLoader(false);
  };

  const shortenText = (text) => {
    return text?.replace(/(.{27})..+/, '$1...');
  };

  const renderFaviconCell = (faviconUrl, index) => {
    return (
      <td className="favicon-cell">
        {faviconUrl ? (
          <LazyGroup cushion="200px">
            <img
              className="favicon-image"
              onError={handleImageError}
              onLoad={handleImageLoad}
              src={faviconUrl}
            />
            {imageLoader && index > 5 && <Oval color={loaderColor.color} width={16} height={16} />}
          </LazyGroup>
        ) : (
          <img className="favicon-image" src={defaultFavUrl} />
        )}
      </td>
    );
  };

  const renderButtonRow = () => {
    return (
      <tr key={uid(tableRowData)} className="show-more-row">
        <td className="show-more-cell text-center" colSpan="4">
          <button className="show-more-btn" onClick={tableRowData.handleOnClick}>
            {tableRowData.name}
          </button>
        </td>
      </tr>
    );
  };

  if (tableRowData.type === 'button') {
    return renderButtonRow();
  }

  const shortenName = shortenText(tableRowData.name);
  const parsedTime = tableRowData.time && DataProcessing.parseSecondsIntoTime(tableRowData.time);

  return (
    <tr key={uid(tableRowData)} className={isActive ? 'active' : ''}>
      <td className="index-cell" data-hover-text={index}>
        {index}
      </td>
      {renderFaviconCell(tableRowData.faviconUrl, index)}
      <td data-hover-text={index < 10 && shortenName}>
        <span>{shortenName}</span>
      </td>
      <td className="text-right" data-hover-text={parsedTime}>
        <span>{parsedTime}</span>
      </td>
    </tr>
  );
};

TableRow.propTypes = {
  tableRowData: PropTypes.object.isRequired,
  index: PropTypes.number,
  hoveredChartItem: PropTypes.oneOfType([PropTypes.string]),
};

export default TableRow;
