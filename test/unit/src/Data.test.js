const utils = require('../../../src/utils');
const config = require('../../../src/config');

const Data = require('../../../src/Data');

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