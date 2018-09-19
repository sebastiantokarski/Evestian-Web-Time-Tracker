const utils = require('../../../../js/utils');
const config = require('../../../../js/config');

const Data = require('../../../../js/class/Data');

const chai = require('chai');
const expect = chai.expect;



describe('Data', () => {

    let data;

    beforeEach(() => {
        data = new Data(config.EXTENSION_DATA_NAME);
    });

    it('Returns data name', () => {
        expect(data.dataName).to.be.a('string').to.equal(config.EXTENSION_DATA_NAME);
    });

});