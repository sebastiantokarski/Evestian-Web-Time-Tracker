/* jshint esversion: 6 */
/* global chrome, define */

define([], () => {

    return {
        ALL_TIME: '_',
        BLACKLIST_PROTOCOL: ['chrome:', 'chrome-extension:', 'vivaldi:', 'file:'],
        COUNT_ONLY_ACTIVE_STATE: true,
        DAY_OF_THE_WEEK: 'dw',
        DEVELOPMENT_MODE: !!chrome.runtime.getManifest().debug,
        DISPLAY_BADGE: true,
        EXTENSION_DATA: 'data',
        INTERVAL_UPDATE_S: 1000,
        INTERVAL_UPDATE_MIN: 1000 * 60
    };

});