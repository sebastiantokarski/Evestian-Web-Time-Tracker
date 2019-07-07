import utils from './utils';
import thenChrome from 'then-chrome';

/**
 * Class representing extension settings
 * Every property user can change in options
 */
class Settings {
  /**
   * Create an object with config properties.
   */
  constructor() {
    this.BLACKLIST_PROTOCOL = [
      'chrome:',
      'chrome-extension:',
      'vivaldi:',
      'file:',
    ],
    this.COUNTY_ONLY_ACTIVE_STATE = true;
    this.IS_ENABLED = true;
  }

  get settingsName() {
    return 'settings';
  }

  setSetting(settingName, settingValue) {
    this[settingName] = settingValue;
    this.save();
  }

  setSettings(newSettings, defaultSettings = this) {
    for (const key in newSettings) {
      if (defaultSettings[key]) {
        defaultSettings[key] = newSettings[key];
      }
    }
  }

  get() {
    const objSettings = {};

    for (const key in this) {
      if (!this.hasOwnProperty(key)) continue;

      objSettings[key] = this[key];
    }

    return objSettings;
  }

  save() {
    const settings = this.get();

    chrome.storage.sync.set({
      [this.settingsName]: settings,
    }, () => {
      utils.debugLog('Settings sucessfully saved', settings);
    });
  }

  async load() {
    let settingsFromStorage = await thenChrome.storage.sync.get(this.settingsName);

    if (Object.keys(settingsFromStorage).length) {
      settingsFromStorage = settingsFromStorage[this.settingsName];
      this.setSettings(settingsFromStorage, this);
    }
    return {};
  }
}

export default new Settings();
