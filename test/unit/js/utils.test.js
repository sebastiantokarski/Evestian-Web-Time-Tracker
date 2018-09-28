const utils = require('../../../js/utils');
const config = require('../../../js/config');
const sinon = require('sinon');
const chrome = require('sinon-chrome');
const chai = require('chai');
const mlog = require('mocha-logger');
const expect = chai.expect;

describe('utils.js', () => {

    before(() => {
        global.chrome = chrome;
    });

    after(() => {
        delete global.chrome;
    });

    describe('Date functions', ()  =>{

        // Fri Jul 14 2017 04:40:00 GMT+0200
        const time = 1500000000000;
        const dayInMs = 1000 * 60 * 60 * 24;
        let clock;

        before(() => {
            clock = sinon.useFakeTimers(time);
        });

        after(() => {
            clock.restore();
        });

        it('getDateString', () => {
            const todayDate = '2017-07-14';
            expect(utils.getDateString()).to.be.a('string').to.equal(todayDate);
            expect(utils.getDateString(new Date(1))).to.be.a('string').to.equal('1970-01-01');
            expect(utils.getDateString(new Date(2000000000000))).to.be.a('string').to.equal('2033-05-18');
        });

        it('getYesterdayDate', () => {
            const yesterdayInMs = new Date(Date.now() - dayInMs);
            // Without toString chai see difference
            expect(utils.getYesterdayDate().toString()).to.equal(yesterdayInMs.toString());
        });

        it('getYesterdayDay', () => {
            const yesterdayDay = '13';
            expect(utils.getYesterdayDay()).to.be.a('string').to.equal(yesterdayDay);
        });

        it('getLastMonth', () => {
            const lastMonth = '6';
            expect(utils.getLastMonth()).to.be.a('string').to.equal(lastMonth);
        });

        it('getLastQuarter', () => {
            const lastQuarter = '2';
            expect(utils.getLastQuarter()).to.be.a('string').to.equal(lastQuarter);
        });

        it('getCurrentYear', () => {
            const currentYear = '2017';
            expect(utils.getCurrentYear()).to.be.a('string').to.equal(currentYear);
        });

        it('getCurrentQuarter', () => {
            const currentQuarter = '3';
            expect(utils.getCurrentQuarter()).to.be.a('string').to.equal(currentQuarter);
        });

        it('getCurrentMonth', () => {
            const currentMonth = '7';
            expect(utils.getCurrentMonth()).to.be.a('string').to.equal(currentMonth);
        });

        it('getCurrentWeekOfTheYear', () => {
            const currentWeekOfTheYear = '28';
            expect(utils.getCurrentWeekOfTheYear()).to.be.a('string').to.equal(currentWeekOfTheYear);
        });

        it('getCurrentDayOfTheWeek', () => {
            const currentDayOfTheWeek = '5';
            expect(utils.getCurrentDayOfTheWeek()).to.be.a('string').to.equal(currentDayOfTheWeek);
        });

        it('getCurrentWeekDetails', () => {
            const currentWeekDetails = '28-5';
            const sundayWeekDetails = '28-7';
            const mondayWeekDetails = '29-1';

            expect(utils.getCurrentWeekDetails()).to.be.a('string').to.equal(currentWeekDetails);

            clock = sinon.useFakeTimers(time + (dayInMs * 2));
            expect(utils.getCurrentWeekDetails()).to.be.a('string').to.equal(sundayWeekDetails);
            clock = sinon.useFakeTimers(time);

            clock = sinon.useFakeTimers(time + (dayInMs * 3));
            expect(utils.getCurrentWeekDetails()).to.be.a('string').to.equal(mondayWeekDetails);
            clock = sinon.useFakeTimers(time);
        });

        it('getCurrentDayOfTheMonth', () => {
            const currentDayOfTheMonth = '14';
            expect(utils.getCurrentDayOfTheMonth()).to.be.a('string').to.equal(currentDayOfTheMonth);
        });

        it('getCurrentTime', () => {
            const currentTime = '04:40';
            expect(utils.getCurrentTime()).to.be.a('string').to.equal(currentTime);
        });

        it('getCurrentHour', () => {
            const currentTime = '4';
            expect(utils.getCurrentHour()).to.be.a('string').to.equal(currentTime);
        });

        it('getCurrentMinute', () => {
            const currentTime = '40';
            expect(utils.getCurrentMinute()).to.be.a('string').to.equal(currentTime);
        });
    });

    it('getFromUrl', () => {
        const url = 'https://www.test.pl/search?q=test';
        const emptyUrl = '';
        expect(utils.getFromUrl('pathname', url)).to.be.a('string').to.equal('/search');
        expect(utils.getFromUrl('search', url)).to.be.a('string').to.equal('?q=test');
        expect(utils.getFromUrl('hash', url)).to.be.a('string').to.equal('');
        expect(utils.getFromUrl('href', emptyUrl)).to.be.a('string').to.equal('');
    });

    it('getActiveTab', () => {
        const tabs1 = [
            { id: 1, active: false },
            { id: 2, active: true },
            { id: 3, active: false }
        ];
        const tabs2 = [
            { id: 4, active: false }
        ];
        expect(utils.getActiveTab(tabs1)).to.be.a('object').to.have.property('id').equal(2);
        expect(utils.getActiveTab(tabs2)).to.be.a('boolean').to.equal(false);
    });

    it('isWindowActive', () => {
        const window1 = {
            focused: true
        };
        const window2 = {
            focused: false
        };
        expect(utils.isWindowActive(window1)).to.be.a('boolean').to.equal(true);
        expect(utils.isWindowActive(window2)).to.be.a('boolean').to.equal(false);
    });

    it('isSoundFromTab', () => {
        const tab1 = {
            audible: true
        };
        const tab2 = {
            audible: false
        };
        expect(utils.isSoundFromTab(tab1)).to.be.a('boolean').to.equal(true);
        expect(utils.isSoundFromTab(tab2)).to.be.a('boolean').to.equal(false);
    });

    it('isStateActive', () => {
        let sandbox = sinon.createSandbox();

        sandbox.stub(config, 'COUNT_ONLY_ACTIVE_STATE').value(false);
        expect(utils.isStateActive()).to.be.a('boolean').to.equal(true);
        sandbox.restore();

        chrome.idle.IdleState = {
            ACTIVE: 'active',
            IDLE: 'idle',
            LOCKED: 'locked'
        };

        expect(utils.isStateActive()).to.be.a('boolean').to.equal(false);
        expect(utils.isStateActive(chrome.idle.IdleState.IDLE)).to.be.a('boolean').to.equal(false);
        expect(utils.isStateActive(chrome.idle.IdleState.ACTIVE)).to.be.a('boolean').to.equal(true);

        delete chrome.idle.IdleState;
    });

    it('isProtocolOnBlacklist', () => {
        const url1 = 'https://www.test.pl/search?q=test';
        const url2 = 'chrome-extension://nfawpnfwiabobopafwanpmodwat';

        let sandbox = sinon.createSandbox();

        sandbox.stub(config, 'BLACKLIST_PROTOCOL').value(['chrome:', 'chrome-extension:']);
        expect(utils.isProtocolOnBlacklist(url1)).to.be.a('boolean').to.equal(false);
        expect(utils.isProtocolOnBlacklist(url2)).to.be.a('boolean').to.equal(true);

        sandbox.restore();
    });

    it('debugLog', () => {
        // @todo
    });

    it('increment', () => {
        let obj = {
            prop1: 12,
            prop2: 0
        };

        expect(utils.increment(obj, 'prop1')).to.be.a('number').to.equal(13);
        expect(utils.increment(obj, 'prop2')).to.be.a('number').to.equal(1);
        expect(utils.increment(obj, 'prop3')).to.be.a('number').to.equal(1);
    });

});

