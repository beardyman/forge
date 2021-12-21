
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from'sinon';
import esmock from 'esmock';


chai.use(chaiAsPromised);

// set testing tools globally so we don't have to import them everywhere
// note that these values need to be added to `overrides.globals` list for the test eslint overrides
global.expect = chai.expect;
global.sinon = sinon;
global.esmock = esmock;
