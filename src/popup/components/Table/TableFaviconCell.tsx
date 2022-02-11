import React, { useState } from 'react';
import { LazyGroup } from 'react-lazy';
import { Oval } from 'react-loader-spinner';
import Color from '../../../js/Color';

export interface TableFaviconCellProps {
  faviconUrl?: string;
}

const TableFaviconCell: React.FC<TableFaviconCellProps> = ({ faviconUrl }) => {
  const defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');
  const loaderColor = new Color('primary');

  const [showImageLoader, setShowImageLoader] = useState(true);

  const handleImageError = (e) => {
    e.target.src = defaultFavUrl;
    setShowImageLoader(false);
  };

  const handleImageLoad = () => {
    setShowImageLoader(false);
  };

  return (
    <td className="favicon-cell">
      {faviconUrl ? (
        <LazyGroup cushion="200px">
          <img
            className="favicon-image"
            onError={handleImageError}
            onLoad={handleImageLoad}
            src={faviconUrl}
            style={{ height: showImageLoader ? '0' : 'unset' }}
          />
          {showImageLoader && <Oval color={loaderColor.color} width={16} height={16} />}
        </LazyGroup>
      ) : (
        <img className="favicon-image" src={defaultFavUrl} />
      )}
    </td>
  );
};

export default TableFaviconCell;
