
import '../bootstrap.js';

describe('Migration', function() {
  let lib, pino;

  beforeEach(async function() {
    pino = sinon.stub().returns('logger');
    lib = await esmock('../../../lib/migration.js', {
      '../../../lib/config': {config: {logLevel: 'probablySomethingReasonable'}},
      'pino': pino
    });
  });

  it('should expose the logger, which is initially undefined', () => {
    expect(lib.log).to.equal(undefined);
  });

  it('should read config and setup a logger', async () => {
    await lib.initializeLogger();
    expect(lib.log).to.equal('logger') // from the mock!
    expect(pino.callCount).to.equal(1);
    expect(pino.args[0][0]).to.deep.equal({name: 'Forge', level: 'probablySomethingReasonable'});
  });
});
