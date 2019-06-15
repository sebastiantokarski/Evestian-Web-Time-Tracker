import config from './config';
import thenChrome from 'then-chrome';
import utils from './utils';

/** Class Data */
export default class Data {
  /**
   * Creating new data based on the data in chrome storage API.
   * If not exist, creates empty object.
   *
   * @param {string} dataName
   */
  constructor(dataName) {
    this.dataName = dataName;
  }

  /**
   * @return {string}
   */
  get dataName() {
    return this._dataName;
  }

  /**
   * @param {string} value
   */
  set dataName(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('dataName is required');
    }
    this._dataName = value;
  }

  /**
   * Updates data in chrome storage local API by overwriting.
   *
   * @param {object} data
   */
  saveInStorage(data = this.data) {
    chrome.storage.local.get(this.dataName, (storage) => {
      const merged = {...storage[this.dataName], ...data};

      chrome.storage.local.set({[this.dataName]: merged}, () => {
        utils.debugLog(`Successfully saved in storage - ${this.dataName}:`, data);
        this.checkDataSize();
      });
    });
  }

  /**
   * Check how many bytes in currently used in storage.
   */
  checkDataSize() {
    chrome.storage.local.getBytesInUse(this.dataName, function(size) {
      const totalSize = chrome.storage.local.QUOTA_BYTES;

      utils.debugLog(`
        Used storage size in bytes: ${size}.
        Percentage: ${ (size / totalSize * 100).toFixed(2) }%`);
    });
  }

  /**
   * Load extension data from chrome storage API.
   * If data does not exist, they are created.
   *
   * @return {Promise}
   */
  loadFromStorage() {
    const self = this;

    return new Promise((resolve) => {
      thenChrome.storage.local.get(self.dataName)
          .then((data) => {
            if (data[self.dataName]) {
              self.data = data[self.dataName];
              utils.debugLog(`Loaded from storage - ${self.dataName}:`, self.data);
            } else {
              self.createEmptyDataObject();
              utils.debugLog(`Item not found in storage - ${self.dataName}`, self.data);
            }
            if (config.DEVELOPMENT_MODE) {
              window.data = this;
            }
            resolve(self.data);
          });
    });
  }

  /**
   * Gets year data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [year=utils.getCurrentYear()]
   * @return {object|null}
   */
  getYearData(hostname, year = utils.getCurrentYear()) {
    return this.data[hostname] ? this.data[hostname][year] : null;
  }

  /**
   * Gets month data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [month=utils.getCurrentMonth()]
   * @return {object|null}
   */
  getMonthData(hostname, month = utils.getCurrentMonth()) {
    const yearData = this.getYearData(hostname);

    return yearData ? yearData[month] : null;
  }

  /**
   * Gets day of the month data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [dayOfTheMonth=utils.getCurrentDayOfTheMonth()]
   * @return {object|null}
   */
  getDayOfTheMonthData(hostname, dayOfTheMonth = utils.getCurrentDayOfTheMonth()) {
    const monthData = this.getMonthData(hostname);

    return monthData ? monthData[dayOfTheMonth] : null;
  }

  /**
   * Gets hour data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [hour=utils.getCurrentHour()]
   * @return {object|null}
   */
  getHourData(hostname, hour = utils.getCurrentHour()) {
    const dayOfTheWeekData = this.getDayOfTheMonthData(hostname);

    return dayOfTheWeekData ? dayOfTheWeekData[hour] : null;
  }

  /**
   * Gets week details (week of the year and day of the week)
   * data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [weekDetails=utils.getCurrentWeekDetails()]
   * @return {object|null}
   */
  getWeekDetailsData(hostname, weekDetails = utils.getCurrentWeekDetails()) {
    const yearData = this.getYearData(hostname);

    return yearData ? yearData[config.WEEK_DETAILS][weekDetails] : null;
  }

  /**
   * Gets today data object for a given domain.
   *
   * @param  {string} hostname
   * @return {object|null}
   */
  getTodayData(hostname) {
    return this.getDayOfTheMonthData(hostname);
  }

  /**
   * Gets yesterday data object for a given domain.
   *
   * @param  {string} hostname
   * @return {object}
   */
  getYesterdayData(hostname) {
    return this.getDayOfTheMonthData(hostname, utils.getYesterdayDay());
  }

  /**
   * Creates initial data object.
   */
  createEmptyDataObject() {
    this.data = {};
    this.data[config.ALL_TIME] = 0;
    this.data[config.FIRST_VISIT] = utils.getDateString();
  }

  /**
   * Creates initial data object for given domain.
   *
   * @param {string} hostname
   * @param {object} dataObj
   */
  createEmptyHostnameDataObject(hostname, dataObj) {
    this.data[hostname] = {
      [dataObj.currentYear]: dataObj.yearObj,
      [config.ALL_TIME]: 0,
    };
    this.data[hostname][config.FAVICON_URL] = null;
    this.data[hostname][config.FIRST_VISIT] = utils.getDateString();
  }

  /**
   * Checks if given hostname is already stored in data.
   *
   * @param  {string} hostname
   * @return {boolean}
   */
  isPageAlreadyInData(hostname) {
    return !!this.data[hostname];
  }

  /**
   * Returns a data storage template for one domain.
   *
   * @return {{
   * currentYear: (string),
   * currentMonth: (string),
   * currentDayOfTheWeek: (string),
   * currentDayOfTheMonth: (string),
   * currentTime: (string),
   * dayOfTheMonthObj: (object),
   * weekDetailsObj: (object),
   * monthObj: (object),
   * yearObj: (object)
   * }}
   */
  getDataObjectTemplate() {
    const dataObj = {
      currentYear: utils.getCurrentYear(),
      currentWeekOfTheYear: utils.getCurrentWeekOfTheYear(),
      currentMonth: utils.getCurrentMonth(),
      currentWeekDetails: utils.getCurrentWeekDetails(),
      currentDayOfTheMonth: utils.getCurrentDayOfTheMonth(),
      currentHour: utils.getCurrentHour(),
      currentMinute: utils.getCurrentMinute(),
    };

    dataObj.minuteObj = {
      [config.ALL_TIME]: 0,
      [dataObj.currentMinute]: 0,
    };
    dataObj.dayOfTheMonthObj = {
      [config.ALL_TIME]: 0,
      [dataObj.currentHour]: dataObj.minuteObj,
    };
    dataObj.weekDetailsObj = {
      [dataObj.currentWeekDetails]: 0,
    };
    dataObj.monthObj = {
      [config.ALL_TIME]: 0,
      [dataObj.currentDayOfTheMonth]: dataObj.dayOfTheMonthObj,
    };
    dataObj.yearObj = {
      [config.ALL_TIME]: 0,
      [config.WEEK_DETAILS]: dataObj.weekDetailsObj,
      [dataObj.currentMonth]: dataObj.monthObj,
    };

    return dataObj;
  }

  /* eslint-disable max-len */
  /**
   * Update extension storage with data.
   *
   * @param  {string} hostname
   * @param  {object} tab
   * @return {object}
   */
  updateDataFor(hostname, tab) {
    const dataObj = this.getDataObjectTemplate();

    if (!this.isPageAlreadyInData(hostname)) {
      this.createEmptyHostnameDataObject(hostname, dataObj);
    }

    // Checking if all objects exist, if not creates "initial" object
    if (!this.getYearData(hostname, dataObj.currentYear)) {
      this.data[hostname][dataObj.currentYear] = dataObj.yearObj;
    } else if (!this.getMonthData(hostname, dataObj.currentMonth)) {
      this.data[hostname][dataObj.currentYear][dataObj.currentMonth] = dataObj.monthObj;
    } else if (!this.getWeekDetailsData(hostname, dataObj.currentWeekDetails)) {
      this.data[hostname][dataObj.currentYear][config.WEEK_DETAILS][dataObj.currentWeekDetails] = 0;
    }
    if (!this.getDayOfTheMonthData(hostname, dataObj.currentDayOfTheMonth)) {
      this.data[hostname][dataObj.currentYear][dataObj.currentMonth][dataObj.currentDayOfTheMonth] = dataObj.dayOfTheMonthObj;
    } else if (!this.getHourData(hostname, dataObj.currentHour)) {
      this.data[hostname][dataObj.currentYear][dataObj.currentMonth][dataObj.currentDayOfTheMonth][dataObj.currentHour] = dataObj.minuteObj;
    }

    // Increment global data
    utils.increment(this.data, config.ALL_TIME);

    // Increment hostname data
    utils.increment(this.data[hostname], config.ALL_TIME);

    utils.increment(this.getYearData(hostname, dataObj.currentYear), config.ALL_TIME);
    utils.increment(this.getMonthData(hostname, dataObj.currentMonth), config.ALL_TIME);
    utils.increment(this.getDayOfTheMonthData(hostname, dataObj.currentDayOfTheMonth), config.ALL_TIME);
    utils.increment(this.getYearData(hostname, dataObj.currentYear)[config.WEEK_DETAILS], dataObj.currentWeekDetails);
    utils.increment(this.getHourData(hostname, dataObj.currentHour), config.ALL_TIME);
    utils.increment(this.getHourData(hostname, dataObj.currentHour), dataObj.currentMinute);

    // Update other data
    this.data[hostname][config.FAVICON_URL] = tab.favIconUrl;
    this.data[hostname][config.LAST_VISIT] = utils.getDateString();

    return {
      todayInSec: this.getTodayData(hostname)[config.ALL_TIME],
      allTimeInSec: this.data[hostname][config.ALL_TIME],
    };
  }
  /* eslint-enable max-len */
}
