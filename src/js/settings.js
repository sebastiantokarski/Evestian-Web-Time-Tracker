import utils from './utils';
import thenChrome from 'then-chrome';

/**
 * Class representing extension settings
 * Every property user can change in options
 *
 * @todo There is a global problem with saving properties in different modules.
 * There should be an event onChange one property which will synchronize
 * all keys with values in storage.
 */
class Settings {
  /**
   * Create an object with default config properties.
   */
  constructor() {
    this.setDefaults();
  }

  /**
   * Every property is described in config.
   *
   * @return {object}
   */
  get config() {
    return {
      BLACKLIST_PROTOCOL: {
        id: 0,
        name: 'Protocols on blacklist',
        type: 'array',
        default: [
          'chrome:',
          'chrome-extension:',
          'vivaldi:',
          'file:',
        ],
        description: `Lista protokołów, na których wtyczka ma nie zliczać spędzonego czasu.
          Przykładowo strony konfiguracyjne przeglądarki, czy pliki otwierane w przeglądarce`,
      },
      COUNTY_ONLY_ACTIVE_STATE: {
        id: 1,
        name: 'Count only active state',
        type: 'boolean',
        default: true,
        description: `Wtyczka zlicza czas tylko wtedy, kiedy dane okno czy karta
          jest aktualnie otwarte, i zarazem jest sfocusowana.`,
      },
      IS_ENABLED: {
        id: 2,
        name: 'Enabled',
        type: 'boolean',
        default: true,
        description: 'Czy wtyczka jest włączona',
      },
    };
  }

  get settingsName() {
    return 'settings';
  }

  setDefaults() {
    const config = this.config;

    Object.keys(config).map((setting) => {
      this[setting] = config[setting].default;
    });
  }

  set(settingName, settingValue, cb) {
    this[settingName] = settingValue;
    this.save(cb);
  }

  setAll(newSettings) {
    for (const key in newSettings) {
      if (this[key]) {
        this[key] = newSettings[key];
      }
    }
  }

  setAllAndSave(newSettings, cb) {
    this.setAll(newSettings);
    this.save(cb);
  }

  get(settingName) {
    return this[settingName];
  }

  getAll() {
    const objSettings = {};

    for (const key in this) {
      if (!this.hasOwnProperty(key)) continue;

      objSettings[key] = this[key];
    }

    return objSettings;
  }

  save(cb = () => utils.debugLog('Settings sucessfully saved', this)) {
    const settings = this.getAll();

    chrome.storage.sync.set({
      [this.settingsName]: settings,
    }, cb);
  }

  async load() {
    let settingsFromStorage = await thenChrome.storage.sync.get(this.settingsName);

    if (Object.keys(settingsFromStorage).length) {
      settingsFromStorage = settingsFromStorage[this.settingsName];
      this.setAll(settingsFromStorage);
    }

    return this;
  }
}

export default new Settings();
