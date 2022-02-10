import React from 'react';
import PropTypes from 'prop-types';

const TableShowMoreBtn = ({ handleClick }) => {
  return (
    <tr className="show-more">
      <td className="show-more-cell text-center" colSpan="4">
        <button className="show-more-btn" onClick={handleClick}>
          Show more
        </button>
      </td>
    </tr>
  );
};

TableShowMoreBtn.propTypes = {
  handleClick: PropTypes.func,
};

export default TableShowMoreBtn;
