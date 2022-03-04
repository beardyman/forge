
import chai from 'chai';
import sinon from'sinon';
import esmock from 'esmock';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';


chai.use( chaiAsPromised );
chai.use( sinonChai );
chai.use( dirtyChai );

// set testing tools globally so we don't have to import them everywhere
// note that these values need to be added to `overrides.globals` list for the test eslint overrides
global.expect = chai.expect;
global.sinon = sinon;
global.esmock = esmock;

export const mochaGlobalSetup = () => {

};

