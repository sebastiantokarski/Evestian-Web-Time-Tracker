import config from 'js/config';
import { debugLog, getCurrentYear, getCurrentWeekOfTheYear, isObject } from 'js/utils';
import Color from './Color';
import DataManagement from './DataManagement';

/** Class DataProcessing. */
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
    return array.sort((a, b) => b[indexToCompare] - a[indexToCompare]);
  }

  /**
   * Sorts descending objects.
   *
   * @param  {object[]} array
   * @param  {string} propertyToCompare
   * @return {*|undefined}
   */
  static sortDescendingObjects(array, propertyToCompare) {
    return array.sort((a, b) => b[propertyToCompare] - a[propertyToCompare]);
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

    for (let i = startNumber; i < numberOfKeys + startNumber; i += 1) {
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
    return Object.entries(obj);
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
      time.seconds -= time.days * oneDay;
      time.days = `${time.days}d`;
    }

    if (time.seconds >= oneHour) {
      time.hours = Math.floor(time.seconds / oneHour);
      time.seconds -= time.hours * oneHour;
      time.hours = time.days ? `${`0${time.hours}`.slice(-2)}h` : `${time.hours}h`;
      time.minutes = '00m';
    } else if (time.days) {
      time.hours = '00h';
      time.minutes = '00m';
    }

    if (time.seconds >= oneMinute) {
      time.minutes = Math.floor(time.seconds / oneMinute);
      time.seconds -= time.minutes * oneMinute;
      time.minutes =
        time.days || time.hours ? `${`0${time.minutes}`.slice(-2)}m` : `${time.minutes}m`;
    } else if (time.days || time.hours) {
      time.minutes = '00m';
    }

    time.seconds = time.minutes ? `${`0${time.seconds}`.slice(-2)}s` : `${time.seconds}s`;

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

    Object.keys(this.data).forEach((hostname) => {
      const years = this.data[hostname];

      Object.keys(years).forEach((year) => {
        if (years?.[year]) {
          allYears.push([year, years[year]]);
        }
      });
    });

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

    for (let i = 0; i < allYears.length; i += 1) {
      try {
        const weekDetails = allYears[i][1][config.WEEK_DETAILS];

        if (isObject(weekDetails)) {
          Object.keys(weekDetails).forEach((key) => {
            allDaysOfTheWeek.push([key, weekDetails[key]]);
          });
        }
      } catch (ex) {
        debugLog('Exception in getAllDaysOfTheWeek', ex, allYears[i]);
      }
    }

    return allDaysOfTheWeek;
  }

  /**
   * @return {Array}
   */
  getAllMonths() {
    return this.constructor.getAllStatsInGivenParentUnit(this.getAllYears());
  }

  /**
   * @return {Array}
   */
  getAllDays() {
    return this.constructor.getAllStatsInGivenParentUnit(this.getAllMonths());
  }

  /**
   * @return {Array}
   */
  getAllHours() {
    return this.constructor.getAllStatsInGivenParentUnit(this.getAllDays());
  }

  /**
   * @return {Array}
   */
  getAllMinutes() {
    return this.constructor.getAllStatsInGivenParentUnit(this.getAllHours(), true);
  }

  /**
   *
   * @param  {Array} parentUnit
   * @param  {boolean} isChildrenUnitNotObject
   * @return {Array}
   */
  static getAllStatsInGivenParentUnit(parentUnit) {
    const all = [];

    for (let i = 0; i < parentUnit.length; i += 1) {
      const unit = parentUnit[i][1];

      Object.keys(unit).forEach((key) => {
        if (key !== config.ALL_TIME) {
          all.push([key, unit[key]]);
        }
      });
    }

    return all;
  }

  /**
   * Returns an array with pages visited in given period sorted descending.
   *
   * @param  {string} periodName - (Today|Yesterday|Month|Year).
   * @param  {string} [period]
   * @return {{
   *  name: string
   *  time: number
   *  faviconUrl: string | null
   * }[]}
   */
  getSortedPagesVisitedInGivenPeriod(periodName, period) {
    const methodName = `get${periodName}Data`;
    const pagesData = [];

    Object.keys(this.data).forEach((key) => {
      if (this.isThisHostnameData(key) && this[methodName](key, period)) {
        pagesData.push({
          name: key,
          time: this[methodName](key, period)[config.ALL_TIME],
          faviconUrl: this.data[key][config.FAVICON_URL],
        });
      }
    });

    return this.constructor.sortDescendingObjects(pagesData, 'time');
  }

  /**
   * Checks is this hostname data by checking if it is data property,
   * and has all_time property.
   *
   * @param  {string} hostname
   * @return {boolean}
   */
  isThisHostnameData(hostname) {
    return typeof this.data[hostname] === 'object' && !!this.data[hostname][config.ALL_TIME];
  }

  /**
   * @return {Array}
   */
  getTimeSpentInHours() {
    const hoursMap = this.constructor.createSimpleMap(24, 0);

    Object.keys(this.data).forEach((hostname) => {
      if (this.isThisHostnameData(hostname)) {
        const today = this.getTodayData(hostname);

        if (today) {
          Object.keys(today).forEach((hour) => {
            if (hour !== config.ALL_TIME) {
              hoursMap[hour] += today[hour][config.ALL_TIME];
            }
          });
        }
      }
    });

    return this.constructor.convertSimpleObjectToArray(hoursMap);
  }

  /**
   * @return {Array}
   */
  getTimeSpentInMinutesToday() {
    const minutesMap = this.constructor.createSimpleMap(60, 0);

    Object.keys(this.data).forEach((hostname) => {
      const today = this.getTodayData(hostname);

      Object.keys(today).forEach((hour) => {
        if (hour !== config.ALL_TIME) {
          Object.keys(today[hour]).forEach((minute) => {
            if (minute !== config.ALL_TIME) {
              minutesMap[minute] += today[hour][minute];
            }
          });
        }
      });
    });

    return this.constructor.convertSimpleObjectToArray(minutesMap);
  }

  // @todo
  /**
   * @return {Array}
   */
  getTimeSpentInMinutesGlobal() {
    const minutesMap = this.constructor.createSimpleMap(60, 0);

    Object.keys(this.data).forEach((hostname) => {
      const hours = this.getAllHours(hostname);

      Object.keys(hours).forEach((minute) => {
        if (minute !== config.ALL_TIME) {
          minutesMap[minute] += hours[minute];
        }
      });
    });

    return this.constructor.convertSimpleObjectToArray(minutesMap);
  }

  /**
   * Returns spent time in days of the current week.
   *
   * @return {Array}
   */
  getTimeSpentInDaysOfTheWeek() {
    const currentWeek = getCurrentWeekOfTheYear();
    const daysOfTheWeekMap = this.constructor.createSimpleMap(7, 0, 1);
    const getWeekTime = (weekDetails, week) => {
      const weekOfTheYear = week.split('-')[0];
      const dayOfTheWeek = week.split('-')[1];

      if (weekOfTheYear === currentWeek) {
        daysOfTheWeekMap[dayOfTheWeek] += weekDetails[week];
      }
    };

    Object.keys(this.data).forEach((hostname) => {
      const getFirstVisitYear = Number(this.data[config.FIRST_VISIT].match(/-(\d{4})$/)[1]);
      const currentYear = Number(getCurrentYear());

      for (let i = getFirstVisitYear; i < currentYear; i += 1) {
        const weekDetails = this.getYearData(hostname)[config.WEEK_DETAILS];

        Object.keys(weekDetails).forEach(getWeekTime.bind(weekDetails));
      }
    });

    return this.constructor.convertSimpleObjectToArray(daysOfTheWeekMap);
  }

  /**
   * Returns total spent time in days of the week.
   *
   * @return {Array}
   */
  getTimeSpentInDaysOfTheWeekTotal() {
    const daysOfTheWeek = this.getAllDaysOfTheWeek();
    const daysOfTheWeekMap = this.constructor.createSimpleMap(7, 0, 1);

    for (let i = 0; i < daysOfTheWeek.length; i += 1) {
      daysOfTheWeekMap[daysOfTheWeek[i][0].match(/-(\d)/)[1]] += daysOfTheWeek[i][1];
    }

    return this.constructor.convertSimpleObjectToArray(daysOfTheWeekMap);
  }

  /**
   * Empty chart data object.
   *
   * @return {object}
   */
  static getEmptyChartData() {
    return {
      data: [],
      labels: [],
      colors: [],
    };
  }

  /**
   * Set color from static array for every label in given data.
   *
   * @param {object} data
   */
  setLabelColors(data) {
    const staticColors = {
      'www.google.com': new Color('google').color,
      'www.google.pl': new Color('google').color,
      'www.youtube.com': new Color('youtube').color,
      'www.facebook.com': new Color('facebook').color,
      'www.instagram.com': new Color('instagram').color,
      'github.com': new Color('github').color,
      'mail.google.com': new Color('gmail').color,
    };
    const defaultColors = [
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

    const colors = data.labels.map((label) => {
      if (staticColors[label]) {
        return staticColors[label];
      }

      if (this.data[label]?.[config.FAVICON_COLOR]) {
        return this.data[label]?.[config.FAVICON_COLOR];
      }

      if (label === 'Other') {
        return '#c0c0c0';
      }
      return defaultColors.pop();
    });

    return colors;
  }

  /**
   * After limit in the array, add all data and put it
   * at the end of array with label 'Other'.
   *
   * @param {object[]} arrayData
   * @param {number} limitData
   * @return {{ data: number[], labels: string[], colors: string[] }}
   */
  generateChartData(arrayData, limitData) {
    let othersTime = 0;

    const chartData = arrayData.reduce((data, singleData, index) => {
      if (index + 1 < limitData) {
        data.data.push(singleData.time);
        data.labels.push(singleData.name);
      } else {
        othersTime += singleData.time;
      }
      return data;
    }, DataProcessing.getEmptyChartData());

    if (othersTime) {
      chartData.data.push(othersTime);
      chartData.labels.push('Other');
    }

    chartData.colors = this.setLabelColors(chartData);

    return chartData;
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
    this.pagesVisitedToday = this.generateChartData(this.pagesVisitedTodayArrayData, 10);

    return {
      chartData: this.pagesVisitedToday,
      tableData: this.pagesVisitedTodayArrayData,
    };
  }

  processPagesVisitedYesterday() {
    this.pagesVisitedYesterdayArrayData = this.getSortedPagesVisitedInGivenPeriod('Yesterday');
    this.pagesVisitedYesterday = this.generateChartData(this.pagesVisitedYesterdayArrayData, 10);

    return {
      chartData: this.pagesVisitedYesterday,
      tableData: this.pagesVisitedYesterdayArrayData,
    };
  }

  processPagesVisitedThisMonth() {
    this.pagesVisitedThisMonthArrayData = this.getSortedPagesVisitedInGivenPeriod('Month');
    this.pagesVisitedThisMonth = this.generateChartData(this.pagesVisitedThisMonthArrayData, 10);

    return {
      chartData: this.pagesVisitedThisMonth,
      tableData: this.pagesVisitedThisMonthArrayData,
    };
  }

  processPagesVisitedAllTime() {
    this.pagesVisitedAllTimeArrayData = this.getSortedPagesVisitedInGivenPeriod('Year');
    this.pagesVisitedAllTime = this.generateChartData(this.pagesVisitedAllTimeArrayData, 10);

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

    timeSpentInHoursTotalDataArray.forEach((time) => {
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
      data: timeSpentEachDayOfTheWeekDataArray.map((dayOfTheWeek) =>
        Math.round(dayOfTheWeek[1] / 60)
      ),
      labels: timeSpentEachDayOfTheWeekDataArray.map((dayOfTheWeek) =>
        this.constructor.convertDayOfTheWeekToName(dayOfTheWeek[0])
      ),
    };

    return this.timeSpentEachDayOfTheWeek;
  }

  processTimeSpentEachDayOfTheWeekTotal() {
    const timeSpentEachDayOfTheWeekTotalDataArray = this.getTimeSpentInDaysOfTheWeekTotal();

    this.timeSpentEachDayOfTheWeekTotal = {
      data: timeSpentEachDayOfTheWeekTotalDataArray.map((dayOfTheWeek) =>
        Math.round(dayOfTheWeek[1] / 60)
      ),
      labels: timeSpentEachDayOfTheWeekTotalDataArray.map((dayOfTheWeek) =>
        this.constructor.convertDayOfTheWeekToName(dayOfTheWeek[0])
      ),
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
