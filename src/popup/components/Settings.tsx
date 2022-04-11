import React, { useEffect, useState } from 'react';
import settings from 'js/settings';
import { Switch } from 'popup/components';

export default function Settings() {
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

  const isGroupOfInputs = (settingDetails) => {
    return settingDetails.type === 'input' && settingDetails.default instanceof Array;
  };

  const renderInput = (settingKey, inputConfig, inputValue) => {
    return (
      <input
        className={`setting-${inputConfig.type}`}
        name={settingKey}
        type={inputConfig.type}
        checked={inputConfig.type === 'checkbox' && settings[settingKey]}
        onChange={handleTargetSettingChange}
        value={inputValue || ''}
      />
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
          <div className="setting-input-wrapper" key={inputValue}>
            {input}
            <button type="button" aria-label="Remove setting" className="remove-icon" />
            {index === arr.length - 1 && (
              <button
                type="button"
                aria-label="Add setting"
                className="add-icon"
                onClick={() => addNewSettingItem(settingKey)}
              />
            )}
          </div>
        );
      });
    }

    if (setting.type === 'checkbox') {
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

  if (!extensionSettings) {
    return null;
  }

  return (
    <>
      {Object.keys(extensionSettings).map((settingKey, index) => {
        const setting = settings.getDetails(settingKey);
        const colWidth = isGroupOfInputs(setting) ? 'col-12' : 'col-3';

        return (
          <div className="setting-item" key={setting.id}>
            <div className="row">
              <div className="col-9">
                <label className="setting-name" htmlFor={`input-${index}`}>
                  {setting.name}
                </label>
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
}
