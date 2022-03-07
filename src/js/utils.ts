import config from './config';

/**
 * Get date with format dd-mm-yyyy.
 *
 * @param  {Date} [date=new Date()]
 * @return {string}
 */
export const getDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${day}-${month}-${year}`;
};

/**
 * Get current year.
 *
 * @return {string}
 */
export const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};

/**
 * Get current quarter.
 *
 * @return {string}
 */
export const getCurrentQuarter = () => {
  return Math.floor((new Date().getMonth() + 3) / 3).toString();
};

/**
 * Get current month.
 *
 * @return {string}
 */
export const getCurrentMonth = () => {
  return (new Date().getMonth() + 1).toString();
};

/**
 * Get yesterday date.
 *
 * @return {Date}
 */
export const getYesterdayDate = () => {
  const date = new Date();

  date.setDate(date.getDate() - 1);
  return date;
};

/**
 * Get the day yesterday.
 *
 * @return {string}
 */
export const getYesterdayDay = () => {
  const yesterdayDate = getYesterdayDate();

  return yesterdayDate.getDate().toString();
};

/**
 * Get yesterday date.
 *
 * @return {string}
 */
export const getLastMonth = () => {
  const currentMonth = parseInt(getCurrentMonth(), 10);
  const lastMonth = currentMonth - 1;

  if (lastMonth === 0) {
    return '12';
  }
  return lastMonth.toString();
};

/**
 * Get last quarter.
 *
 * @return {string}
 */
export const getLastQuarter = () => {
  const currentQuarter = parseInt(getCurrentQuarter(), 10);
  const lastQuarter = currentQuarter - 1;

  if (lastQuarter === 0) {
    return '4';
  }
  return lastQuarter.toString();
};

export const getCurrentWeekOfTheYear = (): string => {
  let date = new Date();
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return weekNo.toString();
};

/**
 * Get current day of the week e.g monday is 1st, sunday is 7th.
 *
 * @return {string}
 */
export const getCurrentDayOfTheWeek = () => {
  let dayOfTheWeek = new Date().getDay();

  // Sunday should be 7th day of the week.
  if (dayOfTheWeek === 0) {
    dayOfTheWeek = 7;
  }

  return dayOfTheWeek.toString();
};

/**
 * Get current week of the year and day of the week.
 *
 * @return {string}
 */
export const getCurrentWeekDetails = () => {
  return `${getCurrentWeekOfTheYear()}-${getCurrentDayOfTheWeek()}`;
};

/**
 * Get current day of the month.
 *
 * @return {string}
 */
export const getCurrentDayOfTheMonth = () => {
  return new Date().getDate().toString();
};

/**
 * Get current time with format hh:mm.
 *
 * @return {string}
 */
export const getCurrentTime = () => {
  const date = new Date();
  const hour = `0${date.getHours()}`.slice(-2);
  const minute = `0${date.getMinutes()}`.slice(-2);

  return `${hour}:${minute}`;
};

/**
 * Get current hour.
 *
 * @return {string}
 */
export const getCurrentHour = () => {
  return new Date().getHours().toString();
};

/**
 * Get current minute.
 *
 * @return {string}
 */
export const getCurrentMinute = () => {
  return new Date().getMinutes().toString();
};

/**
 * Get some properties from url such as protocol, pathname etc.
 *
 * @param  {string} property
 * @param  {string} url
 * @return {string}
 */
export const getFromUrl = (property, url) => {
  const a = document.createElement('a');

  a.href = url;
  return a[property];
};

/**
 * Get active and focused tab.
 *
 * @param  {object[]} tabs
 * @return {object|boolean} Tab object or false.
 */
export const getActiveTab = (tabs) => {
  let i = 0;

  while (i < tabs.length && !tabs[i].active) {
    i += 1;
  }

  if (tabs[i]) {
    return tabs[i];
  }
  return false;
};

/**
 * Check if chrome window is active and focused.
 *
 * @param  {object} window
 * @return {boolean}
 */
export const isWindowActive = (window) => {
  return window && window.focused;
};

/**
 * Is there any sound from the tab (video, player, music).
 *
 * @param  {object} tab
 * @return {boolean}
 */
export const isSoundFromTab = (tab) => {
  return tab && tab.audible;
};

/**
 * Log to console if it is development mode.
 *
 * @param  {*} args
 * @return {undefined}
 */
export const debugLog = (...args) => {
  if (config.DEVELOPMENT_MODE) {
    const fnArguments = [].slice.call(args);

    if (typeof fnArguments[0] === 'string' && fnArguments[0].indexOf('%c') === -1) {
      fnArguments[0] = `%c${fnArguments[0]}`;
      fnArguments.splice(1, 0, 'color: #1E90FF');
    }
    /* eslint-disable no-console */
    console.log(...fnArguments);
    /* eslint-enable no-console */
  }
};

/**
 * Add 1 to current number in a given property.
 *
 * @param  {object} obj
 * @param  {string} prop
 * @return {object}
 */
export const increment = (obj, prop) => {
  const modObj = obj;

  if (modObj[prop] === undefined) {
    modObj[prop] = 0;
  }
  modObj[prop] += 1;
  return modObj[prop];
};

export const isObject = (obj) => {
  return obj != null && obj.constructor.name === 'Object';
};
