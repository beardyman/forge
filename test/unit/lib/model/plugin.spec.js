
import '../../bootstrap.js';


describe( 'Plugin Model and Base Plugin', function() {
  let model, findUp, userClass, utils;

  beforeEach( async function() {
    const pathToPlugin = '../../../MockMigrationStatePlugin.js';

    findUp = sinon.stub().resolves( pathToPlugin );

    userClass = sinon.stub().returnsThis();
    utils = {
      loadUserModule: sinon.stub().resolves({ default: userClass }),
      loadFile: sinon.stub().resolves({ default: userClass })
    };

    model = await esmock( '../../../../lib/model/plugin.js', {
      '../../../../lib/config': { config: { my: 'config' }},
      path: { resolve: sinon.stub().returns( pathToPlugin ) },
      'find-up': { findUp },
      '../../../../lib/fileUtilities': utils
    });
  });

  it( 'should load the plugin from a module', async function() {
    const loadedPlugin = await model.loadPluginFile();
    expect( utils.loadFile.callCount ).to.equal( 1 );
    expect( utils.loadUserModule.callCount ).to.equal( 0 );
    expect( userClass.callCount ).to.equal( 1 );
    expect( userClass.args[0][0]).to.deep.equal({ my: 'config' });
    // test that we can get the plugin

    const plugin = model.default();
    // plugin should be the same result as the loadPluginFile method
    expect( loadedPlugin ).to.deep.equal( plugin );
  });

  it( 'should load the plugin file and return the plugin', async function() {
    const error = new Error();
    error.code = 'ERR_MODULE_NOT_FOUND';
    utils.loadFile.rejects( error );
    const loadedPlugin = await model.loadPluginFile();
    expect( utils.loadFile.callCount ).to.equal( 1 );
    expect( utils.loadUserModule.callCount ).to.equal( 1 );
    expect( userClass.callCount ).to.equal( 1 );
    expect( userClass.args[0][0]).to.deep.equal({ my: 'config' });
    // test that we can get the plugin

    const plugin = model.default();
    // plugin should be the same result as the loadPluginFile method
    expect( loadedPlugin ).to.deep.equal( plugin );
  });

  it( 'should throw any other error', function() {
    utils.loadFile.rejects( new Error( 'my err' ));
    return expect( model.loadPluginFile()).to.have.been.rejected().then(( error )=>{
      expect( utils.loadFile.callCount ).to.equal( 1 );
      expect( utils.loadUserModule.callCount ).to.equal( 0 );
      expect( error.message ).to.equal( 'my err' );
    });
  });
});
