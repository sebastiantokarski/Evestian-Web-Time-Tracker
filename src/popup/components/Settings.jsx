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

  // @todo Bug: Modal is closing (setting vs state.settings)
  addNewSettingItem(settingKey) {
    // const stateSettings = this.state.settings;
    // const currValue = settings.get(settingKey);

    // currValue.push('');
    // stateSettings[settingKey] = currValue;

    // this.setState({
    //  settings: stateSettings,
    // });
  }

  renderSingleSetting(settingKey, inputConfig) {
    // @todo Maybe some normal property like canAddOrRemove, not inputs...
    if (inputConfig.type === 'inputs') {
      inputConfig.type = inputConfig.type.slice(0, -1);

      return this.state.settings[settingKey].map((inputValue, index, arr) => {
        const input = this.renderInput(settingKey, inputConfig, inputValue);

        return <div className="setting-input-wrapper" key={ index }>
          { input }
          <a href="#" className="remove-icon"></a>
          { index === arr.length - 1 && <a href="#" className="add-icon" onClick={
            () => this.addNewSettingItem(settingKey)
          }></a> }
        </div>;
      });
    } else if (inputConfig.type === 'checkbox') {
      return <Switch
        config={ inputConfig }
        name={ settingKey }
        value={ this.state.settings[settingKey] }
        handleSettingChange={ this.handleTargetSettingChange } />;
    }
    return this.renderInput(settingKey, inputConfig);
  }

  renderSettings() {
    const renderedSettings = Object.keys(settings.getAll()).map((settingKey) => {
      const colWidth = settings.config[settingKey].type === 'inputs' ? 'col-12' : 'col-3';

      return (
        <div className="setting-item" key={ settings.config[settingKey].id }>
          <div className="row">
            <div className="col-9">
              <label className="setting-name">{ settings.config[settingKey].name }</label>
            </div>
            <div className={ `${colWidth} align-items-center align-self-center` }>
              { this.renderSingleSetting(settingKey, settings.config[settingKey]) }
            </div>
            <div className="col-12">
              <p className="setting-description">{ settings.config[settingKey].description }</p>
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
      return null;
    }
    return this.renderSettings();
  }
}
