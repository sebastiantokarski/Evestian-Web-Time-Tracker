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
  }

  async getSettings() {
    await settings.load();

    this.setState({ settings: settings.getAll() });
  }

  handleSettingChange(e) {
    const settingName = e.target.name;
    const settingValue = e.target.checked;

    settings.set(settingName, settingValue);

    this.setState({
      settings: settings.getAll(),
    });
  }

  renderInput(name, inputConfig, inputValue) {
    return (
      <input
        className={ `setting-${inputConfig.type}` }
        name={ name }
        type={ inputConfig.type }
        checked={ inputConfig.type === 'checkbox' && this.state.settings[name] }
        onChange={ this.handleSettingChange }
        value={ inputValue ? inputValue : '' }></input>
    );
  }

  renderInputs(name, inputConfig) {
    // @todo Maybe some normal property like canAddOrRemove, not inputs...
    if (inputConfig.type === 'inputs') {
      inputConfig.type = inputConfig.type.slice(0, -1);

      return this.state.settings[name].map((inputValue) => {
        // @ Maybe spread operator
        const input = this.renderInput(name, inputConfig, inputValue);

        return <Fragment>
          { input }
          <a href="#" className="remove-icon"></a>
        </Fragment>;
      });
    } else if (inputConfig.type === 'checkbox') {
      return <Switch
        config={ inputConfig }
        name={ name }
        value={ this.state.settings[name] }
        handleSettingChange={ this.handleSettingChange } />;
    }
    return this.renderInput(name, inputConfig);
  }

  renderSettings() {
    const renderedSettings = Object.keys(settings.getAll()).map((key) => {
      const colWidth = settings.config[key].type === 'inputs' ? 'col-9' : 'col-3';

      return (
        <div className="setting-item row" key={ settings.config[key].id }>
          <div className="col-9">
            <label className="setting-name">{ settings.config[key].name }</label>
          </div>
          <div className={ `${colWidth} align-items-center align-self-center` }>
            { this.renderInputs(key, settings.config[key]) }
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
