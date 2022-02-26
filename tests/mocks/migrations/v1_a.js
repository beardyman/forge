
import sinon from 'sinon';


export const mocks = {
  migrate: sinon.stub().resolves(),
  rollback: sinon.stub().resolves()
};


export function resetMocks() {
  Object.keys( mocks ).forEach(( mock )=>{
    mocks[mock].resetHistory();
  });
}


export const migrate = mocks.migrate;
export const rollback = mocks.rollback;
