import config from './config';
import utils from './utils';
import Color from './Color';
import DataManagement from './DataManagement';

/** Class DataProcessing */
export default class DataProcessing extends DataManagement {
  /**
   * Constructor same as in Data class.
   *
   * @param {string} dataName
   * @param {object} [data]
   */
  constructor(dataName, data) {
    super(dataName);

    if (data) {
      this.data = data;
    } else {
      this.data = chrome.extension.getBackgroundPage().background.dataManagement.data;
    }
  }

  /**
   * Sorts descending tables.
   *
   * @param  {Array} array
   * @param  {number} indexToCompare
   * @return {*|undefined}
   */
  static sortDescending(array, indexToCompare) {
    return array.sort(function(a, b) {
      return b[indexToCompare] - a[indexToCompare];
    });
  }

  /**
   * Creates map, where keys are numbers, and value is the same for every key.
   *
   * @param  {number} numberOfKeys
   * @param  {*} value
   * @param  {number} [startNumber=0]
   * @return {object}
   */
  static createSimpleMap(numberOfKeys, value, startNumber = 0) {
    const newObj = {};

    for (let i = startNumber; i < numberOfKeys + startNumber; i++) {
      newObj[i] = value;
    }

    return newObj;
  }

  /**
   * Converts key to first element, and value to second element of an array.
   *
   * @param  {object} obj
   * @return {Array[]}
   */
  static convertSimpleObjectToArray(obj) {
    const newArray = [];

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      newArray.push([
        key,
        obj[key],
      ]);
    }

    return newArray;
  }

  /**
   * Convert 1 to Monday, 2 to Tuesday etc.
   *
   * @param  {number} dayNumber
   * @return {string}
   */
  static convertDayOfTheWeekToName(dayNumber) {
    const daysMap = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday',
    };

    return daysMap[dayNumber];
  }

  /**
   * Parse seconds into time in format 00d00h00m00s.
   *
   * @param  {number} seconds
   * @return {string}
   */
  static parseSecondsIntoTime(seconds) {
    const oneDay = 60 * 60 * 24;
    const oneHour = 60 * 60;
    const oneMinute = 60;
    const time = {
      days: '',
      hours: '',
      minutes: '',
      seconds,
    };

    if (time.seconds >= oneDay) {
      time.days = Math.floor(time.seconds / oneDay);
      time.seconds -= (time.days * oneDay);
      time.days = time.days + 'd';
    }

    if (time.seconds >= oneHour) {
      time.hours = Math.floor(time.seconds / oneHour);
      time.seconds -= (time.hours * oneHour);
      time.hours = time.days
        ? ('0' + time.hours).slice(-2) + 'h'
        : time.hours + 'h';
      time.minutes = '00m';
    } else if (time.days) {
      time.hours = '00h';
      time.minutes = '00m';
    }

    if (time.seconds >= oneMinute) {
      time.minutes = Math.floor(time.seconds / oneMinute);
      time.seconds -= (time.minutes * oneMinute);
      time.minutes = time.days || time.hours
        ? ('0' + time.minutes).slice(-2) + 'm'
        : time.minutes + 'm';
    } else if (time.days || time.hours) {
      time.minutes = '00m';
    }

    time.seconds = time.minutes
      ? ('0' + time.seconds).slice(-2) + 's'
      : time.seconds + 's';

    return `${time.days}${time.hours}${time.minutes}${time.seconds}`;
  }

  static sum(array) {
    return array.reduce((a, b) => a + b, 0);
  }

  /**
   * Gets all years object from data.
   *
   * @return {Array}
   */
  getAllYears() {
    const allYears = [];

    for (const hostname in this.data) {
      if (!this.data.hasOwnProperty(hostname)
          || !this.isThisHostnameData(hostname)) continue;


      const years = this.data[hostname];

      for (const year in years) {
        if (!years.hasOwnProperty(year)
            || typeof years[year] !== 'object'
            || years[year] === null) continue;

        allYears.push([
          year,
          years[year],
        ]);
      }
    }

    return allYears;
  }

  /**
   * Gets all days of the week object from data.
   *
   * @return {Array}
   */
  getAllDaysOfTheWeek() {
    const allYears = this.getAllYears();
    const allDaysOfTheWeek = [];
    let weekDetails;

    for (let i = 0; i < allYears.length; i++) {
      try {
        weekDetails = allYears[i][1][config.WEEK_DETAILS];

        for (const key in weekDetails) {
          if (!weekDetails.hasOwnProperty(key)) continue;

          allDaysOfTheWeek.push([
            key,
            weekDetails[key],
          ]);
        }
      } catch (ex) {
        utils.debugLog('Exception in getAllDaysOfTheWeek', ex, allYears[i]);
      }
    }

    return allDaysOfTheWeek;
  }

  /**
   * @return {Array}
   */
  getAllMonths() {
    return this.getAllStatsInGivenParentUnit(this.getAllYears());
  }

  /**
   * @return {Array}
   */
  getAllDays() {
    return this.getAllStatsInGivenParentUnit(this.getAllMonths());
  }

  /**
   * @return {Array}
   */
  getAllHours() {
    return this.getAllStatsInGivenParentUnit(this.getAllDays());
  }

  /**
   * @return {Array}
   */
  getAllMinutes() {
    return this.getAllStatsInGivenParentUnit(this.getAllHours(), true);
  }

  /**
   *
   * @param  {Array} parentUnit
   * @param  {boolean} isChildrenUnitNotObject
   * @return {Array}
   */
  getAllStatsInGivenParentUnit(parentUnit, isChildrenUnitNotObject) {
    let unit;
    const all = [];

    for (let i = 0; i < parentUnit.length; i++) {
      unit = parentUnit[i][1];

      for (const key in unit) {
        if (!unit.hasOwnProperty(key)
            || (typeof unit[key] !== 'object' && isChildrenUnitNotObject)
            || key === config.ALL_TIME) continue;

        all.push([
          key,
          unit[key],
        ]);
      }
    }

    return all;
  }

  // eslint-disable-next-line jsdoc/require-description-complete-sentence
  /**
   * Returns an array with pages visited in given period sorted descending.
   *
   * @param  {string} periodName - (Today|Yesterday|Month|Year)
   * @param  {string} [period]
   * @return {Array}
   */
  getSortedPagesVisitedInGivenPeriod(periodName, period) {
    const methodName = `get${periodName}Data`;
    const pagesArray = [];
    const data = this.data;

    for (const key in data) {
      if (!data.hasOwnProperty(key)) continue;
      if (this.isThisHostnameData(key) && this[methodName](key, period)) {
        pagesArray.push([
          key,
          this[methodName](key, period)[config.ALL_TIME],
          data[key][config.FAVICON_URL],
        ]);
      }
    }
    return this.constructor.sortDescending(pagesArray, 1);
  }

  /**
   * Checks is this hostname data by checking if it is data property,
   * and has all_time property.
   *
   * @param  {string} hostname
   * @return {boolean}
   */
  isThisHostnameData(hostname) {
    return typeof this.data[hostname] === 'object'
           && !!this.data[hostname][config.ALL_TIME];
  }

  /**
   * @return {Array}
   */
  getTimeSpentInHours() {
    const hoursMap = this.constructor.createSimpleMap(24, 0);

    for (const hostname in this.data) {
      if (!this.data.hasOwnProperty(hostname)) continue;
      if (this.isThisHostnameData(hostname)) {
        const today = this.getTodayData(hostname);

        for (const hour in today) {
          if (hour !== config.ALL_TIME) {
            hoursMap[hour] += today[hour][config.ALL_TIME];
          }
        }
      }
    }

    return this.constructor.convertSimpleObjectToArray(hoursMap);
  }

  /**
   * @return {Array}
   */
  getTimeSpentInMinutesToday() {
    const minutesMap = this.constructor.createSimpleMap(60, 0);

    for (const hostname in this.data) {
      if (!this.data.hasOwnProperty(hostname)
          || !this.isThisHostnameData(hostname)) continue;

      const today = this.getTodayData(hostname);

      for (const hour in today) {
        if (hour !== config.ALL_TIME) {
          for (const minute in today[hour]) {
            if (minute !== config.ALL_TIME) {
              minutesMap[minute] += today[hour][minute];
            }
          }
        }
      }
    }

    return this.constructor.convertSimpleObjectToArray(minutesMap);
  }

  // @todo
  /**
   * @return {Array}
   */
  getTimeSpentInMinutesGlobal() {
    const minutesMap = this.constructor.createSimpleMap(60, 0);

    for (const hostname in this.data) {
      if (!this.data.hasOwnProperty(hostname)
          || !this.isThisHostnameData(hostname)) continue;

      const hours = this.getAllHours(hostname);

      for (const minute in hours) {
        if (!hours.hasOwnProperty(minute) || minute === config.ALL_TIME) continue;

        minutesMap[minute] += hours[minute];
      }
    }

    return this.constructor.convertSimpleObjectToArray(minutesMap);
  }

  /**
   * Returns spent time in days of the current week.
   *
   * @return {Array}
   */
  getTimeSpentInDaysOfTheWeek() {
    const daysOfTheWeekMap = this.constructor.createSimpleMap(7, 0, 1);

    for (const hostname in this.data) {
      if (!this.data.hasOwnProperty(hostname)
          || !this.isThisHostnameData(hostname)) continue;

      // @todo if this will launch at the beginning of new year, there will be a problem
      const weekDetails = this.getYearData(hostname)[config.WEEK_DETAILS];
      const currentWeek = utils.getCurrentWeekOfTheYear();
      let dayOfTheWeek;
      let weekOfTheYear;

      for (const week in weekDetails) {
        if (!weekDetails.hasOwnProperty(week)) continue;

        weekOfTheYear = week.split('-')[0];
        dayOfTheWeek = week.split('-')[1];

        if (weekOfTheYear === currentWeek) {
          daysOfTheWeekMap[dayOfTheWeek] += weekDetails[week];
        }
      }
    }

    return this.constructor.convertSimpleObjectToArray(daysOfTheWeekMap);
  }

  /**
   * Returns total spent time in days of the week.
   *
   * @return {Array}
   */
  getTimeSpentInDaysOfTheWeekTotal() {
    // @todo if this will launch at the beginning of new year, there will be a problem
    const daysOfTheWeek = this.getAllDaysOfTheWeek();
    const daysOfTheWeekMap = this.constructor.createSimpleMap(7, 0, 1);

    for (let i = 0; i < daysOfTheWeek.length; i++) {
      daysOfTheWeekMap[daysOfTheWeek[i][0].match(/-(\d)/)[1]] += daysOfTheWeek[i][1];
    }

    return this.constructor.convertSimpleObjectToArray(daysOfTheWeekMap);
  }

  /**
   * After limit in the array, add all data and put it
   * at the end of array with label 'Other'.
   *
   * @param  {Array} arrayData
   * @param  {number} limit
   * @return {{
   * data: Array,
   * labels: Array
   * }}
   */
  addOtherData(arrayData, limit) {
    let other = 0;
    const result = {
      data: [],
      labels: [],
    };

    for (let i = 0; i < arrayData.length; i++) {
      if (i < limit - 1) {
        result.data.push(arrayData[i][1]);
        result.labels.push(arrayData[i][0]);
      } else {
        if (result.labels.indexOf('Other') === -1) {
          result.labels.push('Other');
        }
        other += arrayData[i][1];
      }
    }
    result.data[result.data.length] = other;

    return result;
  }

  /**
   * Set color from static array for every label in given data.
   *
   * @param {object} data
   */
  setLabelColors(data) {
    this.labelsCache = this.labelsCache || {
      'www.google.com': new Color('google').color,
      'www.google.pl': new Color('google').color,
      'www.youtube.com': new Color('youtube').color,
      'www.facebook.com': new Color('facebook').color,
      'www.instagram.com': new Color('instagram').color,
      'github.com': new Color('github').color,
      'mail.google.com': new Color('gmail').color,
    };
    this.colors = this.colors || [
      new Color('primary100').color,
      new Color('primary200').color,
      new Color('primary300').color,
      new Color('primary400').color,
      new Color('primary500').color,
      new Color('primary600').color,
      new Color('primary700').color,
      new Color('primary800').color,
      new Color('primary900').color,
    ];

    data.colors = [];

    for (let i = 0; i < data.labels.length; i++) {
      if (this.data[data.labels[i]] && this.data[data.labels[i]][config.FAVICON_COLOR]) {
        data.colors.push(this.data[data.labels[i]][config.FAVICON_COLOR]);
        continue;
      }

      if (data.labels[i] === 'Other') {
        data.colors.push('#c0c0c0');
        this.labelsCache.Other = '#c0c0c0';
        continue;
      }

      if (this.labelsCache[data.labels[i]]) {
        data.colors.push(this.labelsCache[data.labels[i]]);
      } else {
        const color = this.colors.pop();

        this.labelsCache[data.labels[i]] = color;
        data.colors.push(color);
      }
    }
  }

  /* eslint-disable max-len */
  processGeneralData() {
    this.totalTime = this.constructor.parseSecondsIntoTime(this.data[config.ALL_TIME]);
    this.firstVisit = this.data[config.FIRST_VISIT];
    // @todo this -2 is so mysterious
    this.totalDomains = Object.keys(this.data).length - 2;
  }

  processPagesVisitedToday() {
    this.pagesVisitedTodayArrayData = this.getSortedPagesVisitedInGivenPeriod('Today');
    this.pagesVisitedToday = this.addOtherData(this.pagesVisitedTodayArrayData, 10);
    this.setLabelColors(this.pagesVisitedToday);

    return {
      chartData: this.pagesVisitedToday,
      tableData: this.pagesVisitedTodayArrayData,
    };
  }

  processPagesVisitedYesterday() {
    this.pagesVisitedYesterdayArrayData = this.getSortedPagesVisitedInGivenPeriod('Yesterday');
    this.pagesVisitedYesterday = this.addOtherData(this.pagesVisitedYesterdayArrayData, 10);
    this.setLabelColors(this.pagesVisitedYesterday);

    return {
      chartData: this.pagesVisitedYesterday,
      tableData: this.pagesVisitedYesterdayArrayData,
    };
  }

  processPagesVisitedThisMonth() {
    this.pagesVisitedThisMonthArrayData = this.getSortedPagesVisitedInGivenPeriod('Month');
    this.pagesVisitedThisMonth = this.addOtherData(this.pagesVisitedThisMonthArrayData, 10);
    this.setLabelColors(this.pagesVisitedThisMonth);

    return {
      chartData: this.pagesVisitedThisMonth,
      tableData: this.pagesVisitedThisMonthArrayData,
    };
  }

  processPagesVisitedAllTime() {
    this.pagesVisitedAllTimeArrayData = this.getSortedPagesVisitedInGivenPeriod('Year');
    this.pagesVisitedAllTime = this.addOtherData(this.pagesVisitedAllTimeArrayData, 10);
    this.setLabelColors(this.pagesVisitedAllTime);

    return {
      chartData: this.pagesVisitedAllTime,
      tableData: this.pagesVisitedAllTimeArrayData,
    };
  }

  processTimeSpentInHours() {
    const timeSpentInHoursDataArray = this.getTimeSpentInHours();

    this.timeSpentInHours = {
      data: timeSpentInHoursDataArray.map((hour) => Math.round(hour[1] / 60)),
      labels: timeSpentInHoursDataArray.map((hour) => hour[0]),
    };

    return this.timeSpentInHours;
  }

  processTimeSpentInHoursTotal() {
    let timeSpentInHoursTotalDataArray = this.getAllHours();
    const timeMap = this.constructor.createSimpleMap(24, 0);

    timeSpentInHoursTotalDataArray.map((time) => {
      timeMap[time[0]] += time[1][config.ALL_TIME];
    });
    timeSpentInHoursTotalDataArray = this.constructor.convertSimpleObjectToArray(timeMap);
    this.timeSpentInHoursTotal = {
      data: timeSpentInHoursTotalDataArray.map((hour) => Math.round(hour[1] / 60)),
      labels: timeSpentInHoursTotalDataArray.map((hour) => hour[0]),
    };

    return this.timeSpentInHoursTotal;
  }

  processTimeSpentEachDayOfTheWeek() {
    const timeSpentEachDayOfTheWeekDataArray = this.getTimeSpentInDaysOfTheWeek();

    this.timeSpentEachDayOfTheWeek = {
      data: timeSpentEachDayOfTheWeekDataArray.map((dayOfTheWeek) => Math.round(dayOfTheWeek[1] / 60)),
      labels: timeSpentEachDayOfTheWeekDataArray.map((dayOfTheWeek) => this.constructor.convertDayOfTheWeekToName(dayOfTheWeek[0])),
    };

    return this.timeSpentEachDayOfTheWeek;
  }

  processTimeSpentEachDayOfTheWeekTotal() {
    const timeSpentEachDayOfTheWeekTotalDataArray = this.getTimeSpentInDaysOfTheWeekTotal();

    this.timeSpentEachDayOfTheWeekTotal = {
      data: timeSpentEachDayOfTheWeekTotalDataArray.map((dayOfTheWeek) => Math.round(dayOfTheWeek[1] / 60)),
      labels: timeSpentEachDayOfTheWeekTotalDataArray.map((dayOfTheWeek) => this.constructor.convertDayOfTheWeekToName(dayOfTheWeek[0])),
    };

    return this.timeSpentEachDayOfTheWeekTotal;
  }

  /**
   * @deprecated
   * Data processing, calculations for charts etc.
   */
  proceedDataProcessing() {
    const timeSpentInMinutesDataArray = this.getTimeSpentInMinutesToday();

    this.timeSpentInMinutes = {
      data: timeSpentInMinutesDataArray.map((minute) => minute[1]),
      labels: timeSpentInMinutesDataArray.map((minute) => minute[0]),
    };

    // // let timeSpentInMinutesGlobalDataArray = this.getTimeSpentInMinutesGlobal();
    // // this.timeSpentInMinutesGlobal = {
    // //     data: timeSpentInMinutesGlobalDataArray.map(minute => minute[1]),
    // //     labels: timeSpentInMinutesGlobalDataArray.map(minute => minute[0])
    // // };
  }
  /* eslint-enable max-len */
}
