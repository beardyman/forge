
import _ from 'lodash';
import '../../bootstrap.js';


describe( 'Plugin Model and Base Plugin', function() {
  let model, findUp, userClass, loadUserModule;

  before( async function() {
    const pathToPlugin = '../../../MockMigrationStatePlugin.js';

    findUp = sinon.stub().resolves( pathToPlugin );

    userClass = sinon.stub();
    loadUserModule = sinon.stub().resolves({ default: userClass });

    model = await esmock( '../../../../lib/model/plugin.js', {
      '../../../../lib/config': { config: { my: 'config' }},
      path: { resolve: sinon.stub().returns( pathToPlugin ) },
      'find-up': { findUp },
      '../../../../lib/utilities': { loadUserModule }
    });
  });

  it( 'should load the plugin file', async function() {
    await model.loadPluginFile();
    expect( userClass.callCount ).to.equal( 1 );
    expect( userClass.args[0][0]).to.deep.equal({ my: 'config' });
    // expect( )
  });

  it( 'should return the plugin',  function() {
    const plugin = model.default();
    expect( _.keys( plugin )).to.deep.equal([ 'config' ]);
  });
});
