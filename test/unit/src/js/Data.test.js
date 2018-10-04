/* global MAIN_DIR, chrome */

const utils = require(`${MAIN_DIR}/src/js/utils`);
const config = require(`${MAIN_DIR}/src/js/config`);
const Data = require(`${MAIN_DIR}/src/js/Data`);

const chai = require('chai');
const expect = chai.expect;



describe('Data.js', () => {

    let data;

    before(() => {
        data = new Data(config.EXTENSION_DATA_NAME);
    });

    it('Returns data name', () => {
        expect(data.dataName).to.be.a('string').to.equal(config.EXTENSION_DATA_NAME);
    });

});