import React, { useEffect, useState } from 'react';
import { Switch } from 'popup/components';
import settings from 'js/settings';

const Settings = () => {
  const [extensionSettings, setExtensionSettings] = useState();

  useEffect(() => {
    const getSettings = async () => {
      await settings.load();

      setExtensionSettings(settings.getAll());
    };
    getSettings();
  }, []);

  const handleSettingChange = (settingName, settingValue) => {
    settings.set(settingName, settingValue);

    setExtensionSettings(settings.getAll());
  };

  const handleTargetSettingChange = (ev) => {
    const settingName = ev.target.name;
    const settingValue = ev.target.checked;

    handleSettingChange(settingName, settingValue);
  };

  const renderInput = (settingKey, inputConfig, inputValue) => {
    return (
      <input
        className={`setting-${inputConfig.type}`}
        name={settingKey}
        type={inputConfig.type}
        checked={inputConfig.type === 'checkbox' && settings[settingKey]}
        onChange={handleTargetSettingChange}
        value={inputValue ? inputValue : ''}
      ></input>
    );
  };

  const addNewSettingItem = (settingKey) => {
    settings.get(settingKey).push('');

    setExtensionSettings(settings.getAll());
  };

  const renderSingleSetting = (settingKey, setting) => {
    if (isGroupOfInputs(setting)) {
      return settings[settingKey].map((inputValue, index, arr) => {
        const input = renderInput(settingKey, setting, inputValue);

        return (
          <div className="setting-input-wrapper" key={index}>
            {input}
            <a href="#" className="remove-icon"></a>
            {index === arr.length - 1 && (
              <a href="#" className="add-icon" onClick={() => addNewSettingItem(settingKey)}></a>
            )}
          </div>
        );
      });
    } else if (setting.type === 'checkbox') {
      return (
        <Switch
          config={setting}
          name={settingKey}
          value={settings[settingKey]}
          handleSettingChange={handleTargetSettingChange}
        />
      );
    }
    return renderInput(settingKey, setting, '');
  };

  const isGroupOfInputs = (settingDetails) => {
    return settingDetails.type === 'input' && settingDetails.default instanceof Array;
  };

  if (!extensionSettings) {
    return null;
  }

  return (
    <>
      {Object.keys(extensionSettings).map((settingKey) => {
        const setting = settings.getDetails(settingKey);
        const colWidth = isGroupOfInputs(setting) ? 'col-12' : 'col-3';

        return (
          <div className="setting-item" key={setting.id}>
            <div className="row">
              <div className="col-9">
                <label className="setting-name">{setting.name}</label>
              </div>
              <div className={`${colWidth} align-items-center align-self-center`}>
                {renderSingleSetting(settingKey, setting)}
              </div>
              <div className="col-12">
                <p className="setting-description">{setting.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Settings;
