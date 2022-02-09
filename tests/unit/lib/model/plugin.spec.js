
import _ from 'lodash';
import '../../bootstrap.js';

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip('Plugin Model and Base Plugin', function() {
  let model, findUp;

  before(async function() {
    const pathToPlugin = '../../../MockMigrationStatePlugin.js';

    findUp = sinon.stub().resolves(pathToPlugin);

    model = await esmock('../../../../lib/model/plugin.js', {
      '../../../../lib/config': {config: {my: 'config'}},
      path: {resolve: sinon.stub().returns(pathToPlugin)},
      'find-up': {findUp},
    });
  });

  it('should load the plugin file', async function() {
    const plugin = await model.loadPluginFile();
    expect(_.keys(plugin)).to.deep.equal(['config']);
    expect(plugin.createSchema).to.throw('\'createSchema\' must be defined by the forge plugin. Schema undefined will be passed to it.');
    expect(plugin.createTable).to.throw('\'createTable\' must be defined by the forge plugin.');
    expect(plugin.insert).to.throw('\'insert\' must be defined by the forge plugin.');
    expect(plugin.remove).to.throw('\'remove\' must be defined by the forge plugin.');
    expect(plugin.getMigrationState).to.throw('\'getMigrationState\' must be defined by the forge plugin.');
  });

  it('should return the plugin',  function() {
    const plugin = model.default();
    expect(_.keys(plugin)).to.deep.equal(['config']);
  });
});
