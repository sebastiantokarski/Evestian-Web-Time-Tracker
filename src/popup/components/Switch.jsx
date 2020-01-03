import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Switch extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const config = this.props.config;
    const id = `checkbox-${config.id}`;

    return (
      <label className="switch" htmlFor={id}>
        <input
          id={id}
          name={this.props.name}
          type="checkbox"
          checked={this.props.value}
          onChange={this.props.handleSettingChange}
        />
        <div className="slider round"></div>
      </label>
    );
  }
}

Switch.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  config: PropTypes.object.isRequired,
  handleSettingChange: PropTypes.func.isRequired,
};
