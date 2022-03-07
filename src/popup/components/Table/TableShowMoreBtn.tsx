import React from 'react';

export interface TableShowMoreBtnProps {
  handleClick: (event: React.MouseEvent) => void;
}

export default function TableShowMoreBtn({ handleClick }: TableShowMoreBtnProps) {
  return (
    <tr className="show-more">
      <td className="show-more-cell text-center" colSpan={4}>
        <button type="button" className="show-more-btn" onClick={handleClick}>
          Show more
        </button>
      </td>
    </tr>
  );
}
