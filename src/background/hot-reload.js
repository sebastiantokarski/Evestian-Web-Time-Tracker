import utils from '../js/utils';

/**
 * HotReload allows to automatically refresh whole extension
 */
export default class HotReload {
  /**
   * Constructor.
   */
  constructor() {
    this.WATCH_INTERVAL_MS = HotReload.WATCH_INTERVAL_MS;
    this.HARD_RELOAD = HotReload.HARD_RELOAD;

    this.init();
  }

  /**
   * Should also reload active browser tab.
   *
   * @return {boolean}
   */
  static get HARD_RELOAD() {
    return false;
  }

  /**
   * Checking for changes interval delay.
   *
   * @return {number}
   */
  static get WATCH_INTERVAL_MS() {
    return 1000;
  }

  /**
   * Reload whole extension. If HARD_RELOAD is true
   * then reload also active browser tab.
   */
  reload() {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      if (this.HARD_RELOAD && tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
      chrome.runtime.reload();
    });
  }

  /**
   * Get all files from extension directory.
   *
   * @param  {object} dir
   * @return {Promise}
   */
  getFilesInDirectory(dir) {
    return new Promise((resolve) => {
      dir.createReader().readEntries((entries) => {
        Promise.all(entries.filter((e) => e.name[0] !== '.').map((e) =>
          e.isDirectory
            ? this.getFilesInDirectory(e)
            : new Promise((resolve) => e.file(resolve))
        ))
            .then((files) => [].concat(...files))
            .then(resolve);
      });
    });
  }

  /**
   * Creates timestamp 'hash' with last modified date for every file in directory.
   *
   * @param  {object} dir
   * @return {string}
   */
  async timestampForFilesInDirectory(dir) {
    const files = await this.getFilesInDirectory(dir);

    return files.map((file) => `${file.name} ${file.lastModifiedDate}`).join();
  }

  /**
   * Watching for changes in timestamps.
   *
   * @param {object} dir
   * @param {string} [lastTimestamp]
   */
  watchForChanges(dir, lastTimestamp) {
    this.timestampForFilesInDirectory(dir).then((timestamp) => {
      if (!lastTimestamp || (lastTimestamp === timestamp)) {
        setTimeout(() => this.watchForChanges(dir, timestamp), this.WATCH_INTERVAL_MS);
      } else {
        this.reload();
      }
    });
  }

  /**
   * Initialize HotReload.
   */
  init() {
    chrome.management.getSelf((self) => {
      if (self.installType === 'development') {
        utils.debugLog('HotReload - start watching for changes...');
        chrome.runtime.getPackageDirectoryEntry((dir) => this.watchForChanges(dir));
      }
    });
  }
}
