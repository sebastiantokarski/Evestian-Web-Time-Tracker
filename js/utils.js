/* jshint esversion: 6 */
/* global chrome */

define(['./config.js'], (config) => {

    return {

        /**
         * Get some properties from url such as protocol, pathname etc.
         * @param {string} property
         * @param {string} url
         * @returns {string}
         */
        getFromUrl: (property, url) => {
            let a = document.createElement('a');
            a.href = url;
            return a[property];
        },

        /**
         * Get active and focused tab
         * @param {Object[]} tabs
         * @returns {Object|boolean} tab object or false
         */
        getActiveTab: (tabs) => {
            let i = 0;
            while (i < tabs.length && !tabs[i].active) {
                i++;
            }

            if (tabs[i]) {
                return tabs[i];
            }
            return false;
        },

        /**
         * Get date with format yyyy-mm-dd
         * @returns {string}
         */
        getDateString: () => {
            const date = new Date(),
                year = date.getFullYear(),
                month = ('0' + (date.getMonth() + 1)).slice(-2),
                day = ('0' + date.getDate()).slice(-2);
            return `${year}-${month}-${day}`;
        },

        /**
         * Get current quarter
         * @returns {string}
         */
        getQuarterString: () => {
            return Math.floor((new Date().getMonth() + 3) / 3).toString();
        },

        /**
         * Get current month
         * @returns {string}
         */
        getMonthString: () => {
            return (new Date().getMonth() + 1).toString();
        },

        /**
         * Get current day of the week
         */
        getDayOfTheWeekString: () => {
            let dayOfTheWeek = new Date().getDay();
            // Sunday should be 7th day of the week
            if (dayOfTheWeek === 0) {
                dayOfTheWeek = 7;
            }
            return dayOfTheWeek;
        },

        /**
         * Get current time with format hh:mm
         * @returns {string}
         */
        getTimeString: () => {
            const date = new Date(),
                hour = ('0' + date.getHours()).slice(-2),
                minute = ('0' + date.getMinutes()).slice(-2);
            return `${hour}:${minute}`;
        },

        /**
         * Check if chrome window is active and focused
         * @returns {boolean}
         */
        isWindowActive: (window) => {
            return window && window.focused;
        },

        /**
         * Is there any sound from the tab (video, player, music)
         * @param {Object} tab
         * @returns {boolean}
         */
        isSoundFromTab: (tab) => {
            return tab && tab.audible;
        },

        /**
         * Is current state active
         * @param {string} state active, idle or locked
         * @returns {boolean}
         */
        isStateActive: (state) => {
            if (config.COUNT_ONLY_ACTIVE_STATE) {
                return chrome.idle.IdleState.ACTIVE === state;
            }
            return true;
        },

        /**
         * Check if protocol from url is blacklisted
         * @param {string} url
         * @returns {boolean}
         */
        isProtocolOnBlacklist: function (url) {
            return config.BLACKLIST_PROTOCOL.indexOf(this.getFromUrl('protocol', url)) !== -1;
        },

        /**
         * Log to console if it is development mode
         * @param {*} args
         * @return {undefined}
         */
        debugLog: (...args) => {
            if (config.DEVELOPMENT_MODE) {
                let fnArguments = [].slice.call(args);
                if (typeof fnArguments[0] === 'string') {
                    fnArguments[0] = '%c' + fnArguments[0];
                    fnArguments.splice(1, 0, 'color: #1E90FF');
                }
                console.log.apply(console, fnArguments);
            }
        },

        /**
         * Add 1 to current number in a given property
         * @param {Object} obj
         * @param {string} property
         * @returns {Object} obj
         */
        increment: (obj, property) => {
            if (!obj[property]) {
                obj[property] = 0;
            }
            obj[property] += 1;
            return obj[property];
        }
    };

});