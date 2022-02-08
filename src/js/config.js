/**
 * Class representing main extension config.
 * Properties are noeditable.
 * */
class Config {
  /**
   * Create an object with config properties.
   */
  constructor() {
    this.ALL_TIME = '_';
    this.DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';
    this.DISPLAY_BADGE = true;
    this.EXTENSION_DATA_NAME = 'dataOfAllVisitedPages';
    this.FAVICON_COLOR = '_fc';
    this.FAVICON_URL = '_fu';
    this.FIRST_VISIT = '_fv';
    this.FIRST_STARTUP = '_fs';
    this.LAST_VISIT = '_lv';
    this.WEEK_DETAILS = '_wd';
    this.ID_PREFIX = 'chrome_ext_evestian-';
    this.INTERVAL_UPDATE_S = 1000;
    this.INTERVAL_UPDATE_MIN = 1000 * 60;
  }
}

export default new Config();
