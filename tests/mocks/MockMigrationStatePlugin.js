
import sinon from 'sinon';
import {PluginInterface} from '../../index.js';

export const mocks = {
  createSchema: sinon.stub().resolves(),
  createTable: sinon.stub().resolves(),
  insert: sinon.stub().resolves(),
  remove: sinon.stub().resolves(),
  getMigrationState: sinon.stub().resolves()
};

export function resetMocks() {
  Object.keys(mocks).forEach((mock)=>{
    mocks[mock].resetHistory();
  });
}

export default class MockPlugin extends PluginInterface {

  constructor() {
    super();
    Object.keys(mocks).forEach((mock)=>{
      this[mock] = mocks[mock];
    });
  }

}







