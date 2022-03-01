
import '../bootstrap.js';

describe( 'Logger', function() {
  let lib, pino;

  beforeEach( async function() {
    pino = sinon.stub().returns( 'logger' );
    lib = await esmock( '../../../lib/logger.js', {
      '../../../lib/config': { config: { logLevel: 'probablySomethingReasonable' }},
      pino: pino
    });
  });

  it( 'should expose the logger, which is initially undefined', function() {
    expect( lib.log ).to.equal( undefined );
  });

  it( 'should read config and setup a logger', async function() {
    await lib.initializeLogger();
    expect( lib.log ).to.equal( 'logger' ); // from the mock!
    expect( pino.callCount ).to.equal( 1 );
    expect( pino.args[0][0]).to.deep.equal({ name: 'Forge', level: 'probablySomethingReasonable' });
  });
});
