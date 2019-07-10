import React, { Component, Fragment } from 'react';
import settings from '../../js/settings';

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: null,
    };

    this.handleSettingChange = this.handleSettingChange.bind(this);
  }

  async getSettings() {
    await settings.load();

    this.setState({ settings: settings.getAll() });
  }

  // @todo IS_ENABLED requires some additional works in background
  handleSettingChange(e) {
    const settingName = e.target.name;
    const settingValue = e.target.checked;

    settings.set(settingName, settingValue);

    this.setState({
      settings: settings.getAll(),
    });
  }

  renderSettings() {
    const renderedSettings = Object.keys(settings.getAll()).map((key) => {
      return (
        <div className="setting-item row" key={ settings.config[key].id }>
          <div className="col-9">
            <label className="setting-name">{ settings.config[key].name }</label>
          </div>
          <div className="col-3 align-items-center align-self-center">
            <input
              className="setting-input"
              name={ key }
              type={ settings.config[key].type === 'boolean' ? 'checkbox' : 'text' }
              checked={ settings.config[key].type === 'boolean' && this.state.settings[key] }
              onChange={ this.handleSettingChange } ></input>
          </div>
          <div className="col-12">
            <p className="setting-description">{ settings.config[key].description }</p>
          </div>
        </div>
      );
    });

    return <Fragment>{ renderedSettings }</Fragment>;
  }

  componentWillMount() {
    this.getSettings();
  }

  render() {
    if (!this.state.settings) {
      return null;
    }
    return this.renderSettings();
  }
}
