
import _ from 'lodash';
import '../../bootstrap.js';

// eslint-disable-next-line mocha/no-skipped-tests
describe.skip('Plugin Model and Base Plugin', function() {
  let model, findUp/*, plugin*/;

  before(async function() {
    findUp = sinon.stub().resolves('../../plugins/plugin.js');

    // plugin = sinon.stub();

    model = await esmock('../../../../lib/model/plugin.js', {
      '../../../../lib/config': {config: {my: 'config'}},
      path: {resolve: sinon.stub().returns('../../plugins/plugin.js')},
      'find-up': {findUp},
      // '../../../../plugins/plugin.js': {default: plugin}
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
