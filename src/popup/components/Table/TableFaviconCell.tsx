import React, { useState } from 'react';
import { LazyGroup } from 'react-lazy';
import { Oval } from 'react-loader-spinner';
import Color from 'js/Color';

export interface TableFaviconCellProps {
  faviconUrl?: string;
}

export default function TableFaviconCell({ faviconUrl }: TableFaviconCellProps) {
  const defaultFavUrl = chrome.runtime.getURL('/assets/defaultFavicon.png');

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
            alt="favicon"
            src={faviconUrl}
            style={{ height: showImageLoader ? '0' : 'unset' }}
          />
          {showImageLoader && <Oval color={new Color('primary').color} width={16} height={16} />}
        </LazyGroup>
      ) : (
        <img className="favicon-image" alt="favicon" src={defaultFavUrl} />
      )}
    </td>
  );
}
