/* global chrome, define, module */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.config = factory();
    }
}(this, () => {

    return {
        ALL_TIME: '_',
        BLACKLIST_PROTOCOL: ['chrome:', 'chrome-extension:', 'vivaldi:', 'file:'],
        COUNT_ONLY_ACTIVE_STATE: true,
        WEEK_DETAILS: '_wd',
        DEVELOPMENT_MODE: chrome.runtime.getManifest().debug,
        DISPLAY_BADGE: true,
        EXTENSION_DATA_NAME: 'dataOfAllVisitedPages',
        FAVICON_URL: '_fu',
        FIRST_VISIT: '_fv',
        INTERVAL_UPDATE_S: 1000,
        INTERVAL_UPDATE_MIN: 1000 * 60,
        LAST_VISIT: '_lv'
    };

}));
