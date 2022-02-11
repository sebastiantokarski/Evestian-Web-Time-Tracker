import React from 'react';

export interface TableShowMoreBtnProps {
  handleClick: (event: React.MouseEvent) => void;
}

const TableShowMoreBtn: React.FC<TableShowMoreBtnProps> = ({ handleClick }) => {
  return (
    <tr className="show-more">
      <td className="show-more-cell text-center" colSpan={4}>
        <button className="show-more-btn" onClick={handleClick}>
          Show more
        </button>
      </td>
    </tr>
  );
};

export default TableShowMoreBtn;
