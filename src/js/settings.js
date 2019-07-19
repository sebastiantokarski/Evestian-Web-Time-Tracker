import utils from './utils';
import thenChrome from 'then-chrome';

/**
 * Class representing extension settings
 * Every property user can change in options
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
        type: 'inputs',
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
        type: 'checkbox',
        default: true,
        description: `Wtyczka zlicza czas tylko wtedy, kiedy dane okno czy karta
          jest aktualnie otwarte, i zarazem jest sfocusowana.`,
      },
      IS_ENABLED: {
        id: 2,
        name: 'Enabled',
        type: 'checkbox',
        default: true,
        description: 'Czy wtyczka jest włączona',
      },
    };
  }

  get name() {
    return 'settings';
  }

  get area() {
    return 'sync';
  }

  setDefaults() {
    const config = this.config;

    Object.keys(config).map((setting) => {
      // @todo this[setting] should be private
      this[setting] = config[setting].default;
    });
  }

  /**
   * @param {string} settingName
   * @param {*} settingValue
   * @param {Function} [cb]
   */
  set(settingName, settingValue, cb) {
    this[settingName] = settingValue;
    this.save(cb);
  }

  /**
   * @param {object} newSettings
   */
  setAll(newSettings) {
    for (const key in newSettings) {
      if (this[key]) {
        this[key] = newSettings[key];
      }
    }
  }

  /**
   * @param {object} newSettings
   * @param {Function} [cb]
   */
  setAllAndSave(newSettings, cb) {
    this.setAll(newSettings);
    this.save(cb);
  }

  /**
   * @param {string} settingName
   * @return {*}
   */
  get(settingName) {
    return this[settingName];
  }

  /**
   * @return {object} { settingKey: settingValue[, ...] }.
   */
  getAll() {
    const objSettings = {};

    for (const key in this) {
      if (!this.hasOwnProperty(key)) continue;

      objSettings[key] = this[key];
    }

    return objSettings;
  }

  /**
   * @param {Function} [cb]
   */
  save(cb = () => utils.debugLog('Settings sucessfully saved', this)) {
    const settings = this.getAll();

    chrome.storage.sync.set({
      [this.name]: settings,
    }, cb);
  }

  onChangedCallback(changes, area) {
    if (area === this.area) {
      utils.debugLog('Changes in settings:', changes.settings);
      // Synchronize all properties from storage
      this.setAll(changes.settings.newValue);
    }
  }

  setOnChangedListener(cb, bindEl) {
    const onChangedEvent = chrome.storage.onChanged;
    const cbName = cb.name;
    const bindedCb = cb.bind(bindEl);

    if (!this[`isSet_${cbName}`]) {
      Object.defineProperty(this, `isSet_${cbName}`, {
        get: function() {
          return true;
        },
        enumerable: false,
        configurable: false,
      });

      onChangedEvent.addListener(bindedCb);
      utils.debugLog('Listener successfully added', cbName);
    }
  }

  async load() {
    let settingsFromStorage = await thenChrome.storage[this.area].get(this.name);

    if (Object.keys(settingsFromStorage).length) {
      utils.debugLog('Settings loaded', settingsFromStorage[this.name]);
      settingsFromStorage = settingsFromStorage[this.name];
      this.setAll(settingsFromStorage);
    } else {
      utils.debugLog('Settings in storage are empty');
    }

    return this;
  }

  async init() {
    this.setOnChangedListener(this.onChangedCallback, this);
    await this.load();
  }
}

export default new Settings();
