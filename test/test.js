const assert = require('assert');
const utils = require('../js/utils.js');
const mlog = require('mocha-logger');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const testTabs = [{
    'active': false,
    'audible': false,
    'autoDiscardable': true,
    'discarded': false,
    'favIconUrl': 'https://mochajs.org/static/favicon.copy.f17f048f84.ico',
    'height': 974,
    'highlighted': true,
    'id': 104509,
    'incognito': false,
    'index': 14,
    'mutedInfo': {'muted': false},
    'pinned': false,
    'selected': true,
    'status': 'complete',
    'title': 'Mocha - the fun, simple, flexible JavaScript test framework',
    'url': 'https://mochajs.org/#the-test-directory',
    'width': 1920,
    'windowId': 2146
}, {
    'active': true,
    'audible': false,
    'autoDiscardable': true,
    'discarded': false,
    'favIconUrl': 'https://mochajs.org/static/favicon.copy.f17f048f84.ico',
    'height': 974,
    'highlighted': true,
    'id': 110319,
    'incognito': false,
    'index': 29,
    'mutedInfo': {'muted': false},
    'pinned': false,
    'selected': true,
    'status': 'complete',
    'title': 'Mocha - the fun, simple, flexible JavaScript test framework',
    'url': 'https://mochajs.org',
    'width': 1920,
    'windowId': 2146
}, {
    'active': false,
    'audible': false,
    'autoDiscardable': true,
    'discarded': false,
    'favIconUrl': 'https://www.google.com/favicon.ico',
    'height': 974,
    'highlighted': true,
    'id': 116508,
    'incognito': false,
    'index': 33,
    'mutedInfo': {'muted': true},
    'pinned': false,
    'selected': true,
    'status': 'complete',
    'title': 'Google',
    'url': 'https://www.google.com/',
    'width': 1920,
    'windowId': 2146
}];

describe('getFromUrl', function() {
    it('Get some properties from url such as protocol, pathname etc.', function() {
        const url = 'https://www.google.pl/search?q=test';
        assert.equal(utils.getFromUrl('pathname', url), '/search');
        assert.equal(utils.getFromUrl('search', url), '?q=test');
        assert.equal(utils.getFromUrl('hash', url), '');
    });
});

describe('getActiveTab', function () {
   it('Get active and focused tab', function () {
       assert.equal(utils.getActiveTab(testTabs), testTabs[1]);
   });
});

describe('Date functions', function() {

    // Fri Jul 14 2017 04:40:00 GMT+0200
    const time = 1500000000000;
    const dayInMs = 1000 * 60 * 60 * 24;
    let clock;

    beforeEach(function() {
        clock = sinon.useFakeTimers(time);
    });

    it('Should return today\'s mock date', function() {
        const todayDate = '2017-07-14';
        assert.equal(utils.getDateString(), todayDate);
        assert.equal(utils.getDateString(new Date(1)), '1970-01-01');
        assert.equal(utils.getDateString(new Date(2000000000000)), '2033-05-18');
    });

    it('Should return yesterday\'s mock date', function() {
        const yesterdayInMs = new Date(Date.now() - dayInMs);
        assert.equal(utils.getYesterdayDate().toString(), yesterdayInMs.toString());
    });

    it('Should return yesterday\'s mock day', function() {
        const yesterdayDay = '13';
        expect(utils.getYesterdayDay()).to.be.a('string').to.equal(yesterdayDay);
    });

    it('Should return last month\'s mock date', function() {
        const lastMonth = '6';
        expect(utils.getLastMonth()).to.be.a('string').to.equal(lastMonth);
    });

    it('Should return last quarter\'s mock date', function() {
        const lastQuarter = '2';
        expect(utils.getLastQuarter()).to.be.a('string').to.equal(lastQuarter);
    });

    it('Should return current year\'s mock date', function() {
        const currentYear = '2017';
        expect(utils.getCurrentYear()).to.be.a('string').to.equal(currentYear);
    });

    it('Should return current month\'s mock date', function() {
        const currentMonth = '7';
        expect(utils.getCurrentMonth()).to.be.a('string').to.equal(currentMonth);
    });

    it('Should return current day of the month\'s mock date', function() {
        const currentDayOfTheMonth = '14';
        expect(utils.getCurrentDayOfTheMonth()).to.be.a('string').to.equal(currentDayOfTheMonth);
    });

    // it('Should return current day of the week\'s mock date', function() {
    //     const currentDayOfTheWeek = '5';
    //     const sunday = '7';
    //     expect(utils.getCurrentDayOfTheWeek()).to.be.a('string').to.equal(currentDayOfTheWeek);
    //     clock = sinon.useFakeTimers(time + (dayInMs * 2));
    //     expect(utils.getCurrentDayOfTheWeek()).to.be.a('string').to.equal(sunday);
    //     clock = sinon.useFakeTimers(time);
    // });

    it('Should return current time\'s mock date', function() {
        const currentTime = '04:40';
        expect(utils.getCurrentTime()).to.be.a('string').to.equal(currentTime);
    });


    afterEach(function() {
        clock.restore();
    });
});
