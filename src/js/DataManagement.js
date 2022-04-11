import thenChrome from 'then-chrome';
import {
  ALL_TIME_KEY,
  WEEK_DETAILS_KEY,
  STORAGE_DATA_KEY,
  DEVELOPMENT_MODE,
  LAST_VISIT_KEY,
  FIRST_VISIT_KEY,
  FAVICON_URL_KEY,
} from 'js/config';
import {
  debugLog,
  increment,
  getCurrentHour,
  getCurrentMonth,
  getCurrentYear,
  getCurrentDayOfTheMonth,
  getYesterdayDay,
  getCurrentWeekDetails,
  getISODate,
  getCurrentWeekOfTheYear,
  getCurrentMinute,
} from 'js/utils';

/** Class DataManagement. */
export default class DataManagement {
  #dataName = STORAGE_DATA_KEY;

  /**
   * @return {string}
   */
  get dataName() {
    return this.#dataName;
  }

  /**
   * @param {string} value
   */
  set dataName(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('dataName is required');
    }
    this.#dataName = value;
  }

  /**
   * Updates data in chrome storage local API by overwriting.
   *
   * @param {Function} [sendResponse]
   * @return {boolean}
   */
  async saveInStorage(sendResponse) {
    const getStoragePromise = thenChrome.storage.local.get(this.dataName);
    let currentStorage;

    await getStoragePromise.then((storage) => {
      currentStorage = storage[this.dataName];
    });

    const merged = { ...currentStorage, ...this.data };
    const setStoragePromise = thenChrome.storage.local.set({ [this.dataName]: merged });

    await setStoragePromise.then(() => {
      debugLog(`Successfully saved in storage - ${this.dataName}:`, this.data);
      this.checkDataSize();
    });

    if (typeof sendResponse === 'function') {
      sendResponse(true);
    }

    return true;
  }

  /**
   * Check how many bytes in currently used in storage.
   */
  checkDataSize() {
    chrome.storage.local.getBytesInUse(this.dataName, (size) => {
      const totalSize = chrome.storage.local.QUOTA_BYTES;
      const percentage = ((size / totalSize) * 100).toFixed(2);

      debugLog(`Used storage size in bytes: ${size}. Percentage: ${percentage}%`);
    });
  }

  /**
   * Load extension data from chrome storage API.
   * If data does not exist, they are created.
   *
   * @return {Promise}
   */
  loadFromStorage() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    return new Promise((resolve) => {
      thenChrome.storage.local.get(self.dataName).then((data) => {
        if (data[self.dataName]) {
          self.data = data[self.dataName];
          debugLog(`Loaded from storage - ${self.dataName}:`, self.data);
        } else {
          self.createEmptyDataObject();
          debugLog(`Item not found in storage - ${self.dataName}`, self.data);
        }
        if (DEVELOPMENT_MODE) {
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
   * @param  {string} [year=getCurrentYear()]
   * @return {object|null}
   */
  getYearData(hostname, year = getCurrentYear()) {
    return this.data[hostname] ? this.data[hostname][year] : null;
  }

  /**
   * Gets month data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [month=getCurrentMonth()]
   * @return {object|null}
   */
  getMonthData(hostname, month = getCurrentMonth()) {
    const yearData = this.getYearData(hostname);

    return yearData ? yearData[month] : null;
  }

  /**
   * Gets day of the month data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [dayOfTheMonth=getCurrentDayOfTheMonth()]
   * @return {object|null}
   */
  getDayOfTheMonthData(hostname, dayOfTheMonth = getCurrentDayOfTheMonth()) {
    const monthData = this.getMonthData(hostname);

    return monthData ? monthData[dayOfTheMonth] : null;
  }

  /**
   * Gets hour data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [hour=getCurrentHour()]
   * @return {object|null}
   */
  getHourData(hostname, hour = getCurrentHour()) {
    const dayOfTheWeekData = this.getDayOfTheMonthData(hostname);

    return dayOfTheWeekData ? dayOfTheWeekData[hour] : null;
  }

  /**
   * Gets week details (week of the year and day of the week)
   * data object for a given domain.
   *
   * @param  {string} hostname
   * @param  {string} [weekDetails=getCurrentWeekDetails()]
   * @return {object|null}
   */
  getWeekDetailsData(hostname, weekDetails = getCurrentWeekDetails()) {
    const yearData = this.getYearData(hostname);

    return yearData ? yearData[WEEK_DETAILS_KEY][weekDetails] : null;
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
    return this.getDayOfTheMonthData(hostname, getYesterdayDay());
  }

  /**
   * Creates initial data object.
   */
  createEmptyDataObject() {
    this.data = {};
    this.data[ALL_TIME_KEY] = 0;
    this.data[FIRST_VISIT_KEY] = getISODate();
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
      [ALL_TIME_KEY]: 0,
    };
    this.data[hostname][FAVICON_URL_KEY] = null;
    this.data[hostname][FIRST_VISIT_KEY] = getISODate();
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
  static getDataObjectTemplate() {
    const dataObj = {
      currentYear: getCurrentYear(),
      currentWeekOfTheYear: getCurrentWeekOfTheYear(),
      currentMonth: getCurrentMonth(),
      currentWeekDetails: getCurrentWeekDetails(),
      currentDayOfTheMonth: getCurrentDayOfTheMonth(),
      currentHour: getCurrentHour(),
      currentMinute: getCurrentMinute(),
    };

    dataObj.minuteObj = {
      [ALL_TIME_KEY]: 0,
      [dataObj.currentMinute]: 0,
    };
    dataObj.dayOfTheMonthObj = {
      [ALL_TIME_KEY]: 0,
      [dataObj.currentHour]: dataObj.minuteObj,
    };
    dataObj.weekDetailsObj = {
      [dataObj.currentWeekDetails]: 0,
    };
    dataObj.monthObj = {
      [ALL_TIME_KEY]: 0,
      [dataObj.currentDayOfTheMonth]: dataObj.dayOfTheMonthObj,
    };
    dataObj.yearObj = {
      [ALL_TIME_KEY]: 0,
      [WEEK_DETAILS_KEY]: dataObj.weekDetailsObj,
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
    const dataObj = DataManagement.getDataObjectTemplate();

    if (!this.isPageAlreadyInData(hostname)) {
      this.createEmptyHostnameDataObject(hostname, dataObj);
    }

    // Checking if all objects exist, if not creates "initial" object
    if (!this.getYearData(hostname, dataObj.currentYear)) {
      this.data[hostname][dataObj.currentYear] = dataObj.yearObj;
    } else if (!this.getMonthData(hostname, dataObj.currentMonth)) {
      this.data[hostname][dataObj.currentYear][dataObj.currentMonth] = dataObj.monthObj;
    } else if (!this.getWeekDetailsData(hostname, dataObj.currentWeekDetails)) {
      this.data[hostname][dataObj.currentYear][WEEK_DETAILS_KEY][dataObj.currentWeekDetails] = 0;
    }
    if (!this.getDayOfTheMonthData(hostname, dataObj.currentDayOfTheMonth)) {
      this.data[hostname][dataObj.currentYear][dataObj.currentMonth][dataObj.currentDayOfTheMonth] =
        dataObj.dayOfTheMonthObj;
    } else if (!this.getHourData(hostname, dataObj.currentHour)) {
      this.data[hostname][dataObj.currentYear][dataObj.currentMonth][dataObj.currentDayOfTheMonth][
        dataObj.currentHour
      ] = dataObj.minuteObj;
    }

    // Increment global data
    increment(this.data, ALL_TIME_KEY);

    // Increment hostname data
    increment(this.data[hostname], ALL_TIME_KEY);

    increment(this.getYearData(hostname, dataObj.currentYear), ALL_TIME_KEY);
    increment(this.getMonthData(hostname, dataObj.currentMonth), ALL_TIME_KEY);
    increment(this.getDayOfTheMonthData(hostname, dataObj.currentDayOfTheMonth), ALL_TIME_KEY);
    increment(
      this.getYearData(hostname, dataObj.currentYear)[WEEK_DETAILS_KEY],
      dataObj.currentWeekDetails
    );
    increment(this.getHourData(hostname, dataObj.currentHour), ALL_TIME_KEY);
    increment(this.getHourData(hostname, dataObj.currentHour), dataObj.currentMinute);

    // Update other data
    if (tab.favIconUrl) {
      this.data[hostname][FAVICON_URL_KEY] = tab.favIconUrl;
    }
    this.data[hostname][LAST_VISIT_KEY] = getISODate();

    return {
      todayInSec: this.getTodayData(hostname)[ALL_TIME_KEY],
      allTimeInSec: this.data[hostname][ALL_TIME_KEY],
    };
  }
  /* eslint-enable max-len */
}
