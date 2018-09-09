/* jshint esversion: 6 */
/* global chrome, define */

define([], () => {

    return {
        DEVELOPMENT_MODE: !!chrome.runtime.getManifest().debug,
        EXTENSION_DATA: 'data',
        DISPLAY_BADGE: true,
        COUNT_ONLY_ACTIVE_STATE: true,
        INTERVAL_UPDATE_S: 1000,
        INTERVAL_UPDATE_MIN: 1000 * 60,
        BLACKLIST_PROTOCOL: ['chrome:', 'chrome-extension:', 'vivaldi:', 'file:']
    };

});