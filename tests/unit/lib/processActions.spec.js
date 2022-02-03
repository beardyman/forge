
import '../bootstrap.js';

describe('Process Actions', function() {
  let lib;


  beforeEach(async function() {
    lib = await esmock('../../../lib/processActions.js', {
      '../../../lib/config': {config: {logLevel: 'probablySomethingReasonable'}},
      '../../../lib/logger': { log: {debug: sinon.stub(), info: sinon.stub()}},
      '../../../lib/model/migrationState': '',
      '../../../lib/model/migrations': ''
    });
  });

  it('should work', function() {
    expect(lib).to.not.be.undefined;
  });
});
