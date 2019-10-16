import React, { Component, Fragment } from 'react';
import Switch from './Switch.jsx';
import settings from '../../js/settings';

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: null,
    };

    this.handleSettingChange = this.handleSettingChange.bind(this);
    this.handleTargetSettingChange = this.handleTargetSettingChange.bind(this);
    this.addNewSettingItem = this.addNewSettingItem.bind(this);
  }

  async getSettings() {
    await settings.load();

    this.setState({ settings: settings.getAll() });
  }

  handleTargetSettingChange(e) {
    const settingName = e.target.name;
    const settingValue = e.target.checked;

    this.handleSettingChange(settingName, settingValue);
  }

  handleSettingChange(settingName, settingValue) {
    settings.set(settingName, settingValue);

    this.setState({
      settings: settings.getAll(),
    });
  }

  renderInput(settingKey, inputConfig, inputValue) {
    return (
      <input
        className={ `setting-${inputConfig.type}` }
        name={ settingKey }
        type={ inputConfig.type }
        checked={ inputConfig.type === 'checkbox' && this.state.settings[settingKey] }
        onChange={ this.handleTargetSettingChange }
        value={ inputValue ? inputValue : '' }></input>
    );
  }

  addNewSettingItem(settingKey) {
    settings.get(settingKey).push('');

    this.setState({
      settings: settings.getAll(),
    });
  }

  isGroupOfInputs(settingDetails) {
    return settingDetails.type === 'input' && settingDetails.default instanceof Array;
  }

  renderSingleSetting(settingKey, setting) {
    if (this.isGroupOfInputs(setting)) {
      return this.state.settings[settingKey].map((inputValue, index, arr) => {
        const input = this.renderInput(settingKey, setting, inputValue);

        return <div className="setting-input-wrapper" key={ index }>
          { input }
          <a href="#" className="remove-icon"></a>
          { index === arr.length - 1 && <a href="#" className="add-icon" onClick={
            () => this.addNewSettingItem(settingKey)
          }></a> }
        </div>;
      });
    } else if (setting.type === 'checkbox') {
      return <Switch
        config={ setting }
        name={ settingKey }
        value={ this.state.settings[settingKey] }
        handleSettingChange={ this.handleTargetSettingChange } />;
    }
    return this.renderInput(settingKey, setting);
  }

  renderSettings() {
    const renderedSettings = Object.keys(this.state.settings).map((settingKey) => {
      const setting = settings.getDetails(settingKey);
      const colWidth = this.isGroupOfInputs(setting) ? 'col-12' : 'col-3';

      return (
        <div className="setting-item" key={ setting.id }>
          <div className="row">
            <div className="col-9">
              <label className="setting-name">{ setting.name }</label>
            </div>
            <div className={ `${colWidth} align-items-center align-self-center` }>
              { this.renderSingleSetting(settingKey, setting) }
            </div>
            <div className="col-12">
              <p className="setting-description">{ setting.description }</p>
            </div>
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
      // @todo loader
      return null;
    }
    return this.renderSettings();
  }
}
