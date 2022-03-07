import thenChrome from 'then-chrome';
import { debugLog } from 'js/utils';

const defaultSettings = {
  BLACKLISTED_URLS: {
    id: 0,
    name: 'Blacklisted URLs',
    type: 'input',
    default: ['file://*', 'chrome://*', 'chrome-extension://*'],
    description: `Lista stron, na których wtyczka ma nie zliczać spędzonego czasu.
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
  TIME_ON_BADGE: {
    id: 3,
    name: 'Time on badge',
    type: 'radio',
    default: {
      timeSpentEachSiteToday: true,
      timeSpentToday: false,
      timeSpentAllTime: false,
      timeSpendEachSiteAllTime: false,
    },
    description: '',
  },
};

class Settings {
  #storageKey = 'settings';

  constructor() {
    this.setDefaults();
  }

  setDefaults() {
    Object.keys(defaultSettings).forEach((setting) => {
      this[setting] = defaultSettings[setting].default;
    });
  }

  /**
   * @param {string} settingKey
   * @return {object}
   */
  getDetails(settingKey) {
    return defaultSettings[settingKey];
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
    Object.keys(newSettings).forEach((setting) => {
      if (this[setting]) {
        this[setting] = newSettings[setting];
      }
    });
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

    Object.keys(this).forEach((key) => {
      objSettings[key] = this[key];
    });

    return objSettings;
  }

  /**
   * @param {Function} [cb]
   */
  save(cb = () => debugLog('Settings sucessfully saved', this)) {
    const settings = this.getAll();

    chrome.storage.sync.set({ [this.#storageKey]: settings }, cb);
  }

  /**
   * @param {Function} cb
   * @param {object} [bindEl]
   */
  setOnChangedListener(cb, bindEl) {
    const onChangedEvent = chrome.storage.onChanged;
    const cbName = cb.name;
    const bindedCb = cb.bind(bindEl);

    if (!this[`isSet_${cbName}`]) {
      Object.defineProperty(this, `isSet_${cbName}`, {
        get: () => true,
        enumerable: false,
        configurable: false,
      });

      onChangedEvent.addListener((changes, area) => {
        const settingsChanges = changes[this.#storageKey];

        if (settingsChanges && area === 'sync' && settingsChanges.oldValue) {
          debugLog('Changes in settings:', settingsChanges);
          bindedCb(settingsChanges);
        }
      });
      debugLog('Listener successfully added', cbName);
    }
  }

  async load() {
    let settingsFromStorage = await thenChrome.storage.sync.get(this.#storageKey);

    if (Object.keys(settingsFromStorage).length) {
      debugLog('Settings loaded', settingsFromStorage[this.#storageKey]);
      settingsFromStorage = settingsFromStorage[this.#storageKey];
      this.setAll(settingsFromStorage);
    } else {
      debugLog('Settings in storage are empty');
    }

    return this;
  }

  async init() {
    await this.load();
  }
}

export default new Settings();
