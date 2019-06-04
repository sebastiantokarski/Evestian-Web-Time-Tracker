/* eslint-disable */
class Config {
  constructor() {
    this.ALL_TIME = '_';
    this.BLACKLIST_PROTOCOL = [
      'chrome:',
      'chrome-extension:',
      'vivaldi:',
      'file:',
    ];
    this.COUNT_ONLY_ACTIVE_STATE = true;
    this.WEEK_DETAILS = '_wd';
    this.DEVELOPMENT_MODE = chrome.runtime.getManifest().debug;
    this.DISPLAY_BADGE = true;
    this.EXTENSION_DATA_NAME = 'dataOfAllVisitedPages';
    this.FAVICON_URL = '_fu';
    this.FIRST_VISIT = '_fv';
    this.INTERVAL_UPDATE_S = 1000;
    this.INTERVAL_UPDATE_MIN = 1000 * 60;
    this.LAST_VISIT = '_lv';
  }
}

export default new Config();
