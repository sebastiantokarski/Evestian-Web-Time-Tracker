import config from './config';

/** Class containing a set of tools useful in many modules. */
class Utils {
  /**
   * Get date with format dd-mm-yyyy.
   *
   * @param  {Date} [date=new Date()]
   * @return {string}
   */
  getDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${day}-${month}-${year}`;
  }

  /**
   * Get yesterday date.
   *
   * @return {Date}
   */
  getYesterdayDate() {
    const date = new Date();

    date.setDate(date.getDate() - 1);
    return date;
  }

  /**
   * Get the day yesterday.
   *
   * @return {string}
   */
  getYesterdayDay() {
    const yesterdayDate = this.getYesterdayDate();

    return yesterdayDate.getDate().toString();
  }

  /**
   * Get yesterday date.
   *
   * @return {string}
   */
  getLastMonth() {
    const currentMonth = parseInt(this.getCurrentMonth(), 10);
    const lastMonth = currentMonth - 1;

    if (lastMonth === 0) {
      return '12';
    }
    return lastMonth.toString();
  }

  /**
   * Get last quarter.
   *
   * @return {string}
   */
  getLastQuarter() {
    const currentQuarter = parseInt(this.getCurrentQuarter(), 10);
    const lastQuarter = currentQuarter - 1;

    if (lastQuarter === 0) {
      return '4';
    }
    return lastQuarter.toString();
  }

  /**
   * Get current year.
   *
   * @return {string}
   */
  getCurrentYear() {
    return new Date().getFullYear().toString();
  }

  /**
   * Get current quarter.
   *
   * @return {string}
   */
  getCurrentQuarter() {
    return Math.floor((new Date().getMonth() + 3) / 3).toString();
  }

  /**
   * Get current month.
   *
   * @return {string}
   */
  getCurrentMonth() {
    return (new Date().getMonth() + 1).toString();
  }

  /**
   * Get current week of the year.
   *
   * @param  {Date} date
   * @return {string}
   */
  getCurrentWeekOfTheYear(date = new Date()) {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(( ( (date - yearStart) / 86400000) + 1) / 7);

    return weekNo.toString();
  }

  /**
   * Get current day of the week e.g monday is 1st, sunday is 7th.
   *
   * @return {string}
   */
  getCurrentDayOfTheWeek() {
    let dayOfTheWeek = new Date().getDay();

    // Sunday should be 7th day of the week.
    if (dayOfTheWeek === 0) {
      dayOfTheWeek = 7;
    }

    return dayOfTheWeek.toString();
  }

  /**
   * Get current week of the year and day of the week.
   *
   * @return {string}
   */
  getCurrentWeekDetails() {
    return `${this.getCurrentWeekOfTheYear()}-${this.getCurrentDayOfTheWeek()}`;
  }

  /**
   * Get current day of the month.
   *
   * @return {string}
   */
  getCurrentDayOfTheMonth() {
    return new Date().getDate().toString();
  }

  /**
   * Get current time with format hh:mm.
   *
   * @return {string}
   */
  getCurrentTime() {
    const date = new Date();
    const hour = ('0' + date.getHours()).slice(-2);
    const minute = ('0' + date.getMinutes()).slice(-2);

    return `${hour}:${minute}`;
  }

  /**
   * Get current hour.
   *
   * @return {string}
   */
  getCurrentHour() {
    return new Date().getHours().toString();
  }

  /**
   * Get current minute.
   *
   * @return {string}
   */
  getCurrentMinute() {
    return new Date().getMinutes().toString();
  }

  /**
   * Get some properties from url such as protocol, pathname etc.
   *
   * @param  {string} property
   * @param  {string} url
   * @return {string}
   */
  getFromUrl(property, url) {
    const a = document.createElement('a');

    a.href = url;
    return a[property];
  }

  // eslint-disable-next-line jsdoc/require-description-complete-sentence
  /**
   * Get active and focused tab.
   *
   * @param  {object[]} tabs
   * @return {object|boolean} tab object or false
   */
  getActiveTab(tabs) {
    let i = 0;

    while (i < tabs.length && !tabs[i].active) {
      i++;
    }

    if (tabs[i]) {
      return tabs[i];
    }
    return false;
  }

  /**
   * Check if chrome window is active and focused.
   *
   * @param  {object} window
   * @return {boolean}
   */
  isWindowActive(window) {
    return window && window.focused;
  }

  // eslint-disable-next-line jsdoc/require-description-complete-sentence
  /**
   * Is there any sound from the tab (video, player, music).
   *
   * @param  {object} tab
   * @return {boolean}
   */
  isSoundFromTab(tab) {
    return tab && tab.audible;
  }

  /**
   * Log to console if it is development mode.
   *
   * @param  {*} args
   * @return {undefined}
   */
  debugLog(...args) {
    if (config.DEVELOPMENT_MODE) {
      const fnArguments = [].slice.call(args);

      if (typeof fnArguments[0] === 'string' && fnArguments[0].indexOf('%c') == -1) {
        fnArguments[0] = '%c' + fnArguments[0];
        fnArguments.splice(1, 0, 'color: #1E90FF');
      }
      /* eslint-disable no-console */
      console.log(...fnArguments);
      /* eslint-enable no-console */
    }
  }

  // eslint-disable-next-line jsdoc/require-description-complete-sentence
  /**
   * Add 1 to current number in a given property.
   *
   * @param  {object} obj
   * @param  {string} property
   * @return {object} obj
   */
  increment(obj, property) {
    if (!obj[property]) {
      obj[property] = 0;
    }
    obj[property] += 1;
    return obj[property];
  }
}

export default new Utils();
