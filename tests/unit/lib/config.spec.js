
import _ from 'lodash';
import '../bootstrap.js';

describe('Config', function() {
  let lib, findUp, jsonConfig, jsonRequire;

  const configSetter = (configs, name) => {
    _.map(configs, (value, key)=>{
      _.set(jsonConfig, `forge.${name && key !== 'logLevel' ? `${name}.`:''}${key}`, value);
    });
    return jsonConfig
  }

  beforeEach(async function() {
    findUp = sinon.stub().resolves('somePath');

    jsonConfig = {forge: {pluginFile: 'someFile'}};
    jsonRequire = sinon.stub().returns(jsonConfig);
    const moduleLoader = {createRequire: sinon.stub().returns(jsonRequire)};

    lib = await esmock('../../../lib/config.js', {
      'find-up': {findUp},
      module: moduleLoader
    });
  });

  describe ('test helper function', ()=>{

    it('should set values in the base object when theres no name provided', ()=>{
      const testConfig = {
        logLevel: 'low',
        schema: 'woots'
      }
      expect(configSetter(testConfig)).to.deep.equal({
        forge:{
          logLevel: 'low',
          pluginFile: 'someFile',
          schema: 'woots'
        }});
    });

    it('should set values in a named config', ()=>{
      const testConfig = {
        logLevel: 'low',
        pluginFile: 'pluggs',
        schema: 'woots'
      }
      jsonConfig = {};
      expect(configSetter(testConfig, 'shaweeetConfig')).to.deep.equal({
        forge:{
          logLevel: 'low',
          shaweeetConfig: {
            pluginFile: 'pluggs',
            schema: 'woots'
          }
        }});
    });
  });


  it('should expose the config, its initial state should be undefined', function () {
    expect(lib.config).to.equal(undefined);
  });

  it('should throw an error when required properties aren\'t specified', async function () {
    jsonRequire.returns({});
    await expect(lib.loadConfig()).to.be.rejected().then((error)=>{
      expect(error.message).to.equal('Forge configuration is missing required properties (pluginFile)');
    });
  });

  it('should load defaults if all required properties are specified', async function () {
    const config = await lib.loadConfig();

    expect(config).to.deep.equal(lib.config);
    expect(config).to.deep.equal({
      logLevel: 'info',
      migrationTable: 'forge_migrations',
      migrationsDirectory: 'migrations',
      pluginFile: 'someFile',
      schema: 'public'
    });
  });

  it('should load any user specified properties', async function () {
    jsonConfig = configSetter({logLevel: 'debug', schema: 'dopeSchema'});

    jsonRequire.returns(jsonConfig);
    const config = await lib.loadConfig();

    expect(config).to.deep.equal(lib.config);
    expect(config).to.deep.equal({
      logLevel: 'debug',
      migrationTable: 'forge_migrations',
      migrationsDirectory: 'migrations',
      pluginFile: 'someFile',
      schema: 'dopeSchema'
    });
  });

  describe('named configs', ()=> {

    beforeEach(()=>{
      jsonConfig = {};
      jsonConfig = configSetter({logLevel: 'debug', right: 'one', pluginFile: 'pluggs', schema: 'dopeSchema'}, 'right');
      jsonConfig = configSetter({other: 'config'}, 'wrong');
      jsonRequire.returns(jsonConfig);
    });

    it('should throw an error if the named config doesn\'t exist', async function () {
      await expect(lib.loadConfig('doesn\'t exist')).to.be.rejected().then((error)=>{
        expect(error.message).to.equal('Cannot find configuration named "doesn\'t exist" in forge configuration.');
      });
    });

    it('should validate properties of a named config', async function () {
      await expect(lib.loadConfig('wrong')).to.be.rejected().then((error)=>{
        expect(error.message).to.equal('Forge configuration is missing required properties for the "wrong" migration configuration (pluginFile)');
      });
    });

    it('should load a specificly named config', async function () {
      const config = await lib.loadConfig('right');

      expect(config).to.deep.equal(lib.config);
      expect(config).to.deep.equal({
        logLevel: 'debug',
        migrationTable: 'forge_migrations',
        migrationsDirectory: 'migrations',
        pluginFile: 'pluggs',
        right: 'one',
        schema: 'dopeSchema'
      });
    });
  });
});
