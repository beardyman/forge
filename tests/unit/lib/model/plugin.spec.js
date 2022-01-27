
import _ from 'lodash';
import '../../bootstrap.js';

describe('Plugin Model and Base Plugin', function() {
  let model;

  before(async function() {
    model = await esmock('../../../../lib/model/plugin.js', {
      '../../../../lib/config': {my: 'config'},
      path: {resolve: sinon.stub().returns('../../plugins/plugin.js')},
    });
  });

  it('should load the plugin file', async function() {
    const plugin = await model.loadPluginFile();
    expect(_.keys(plugin)).to.deep.equal(['config']);
    expect(plugin.createSchema).to.throw('`createSchema` must be defined by the forge plugin.');
    expect(plugin.createTable).to.throw('`createTable` must be defined by the forge plugin.');
    expect(plugin.insert).to.throw('`insert` must be defined by the forge plugin.');
    expect(plugin.remove).to.throw('`remove` must be defined by the forge plugin.');
    expect(plugin.getMigrationState).to.throw('`getMigrationState` must be defined by the forge plugin.');

  });

  it('should return the plugin',  function() {
    const plugin = model.default();
    expect(_.keys(plugin)).to.deep.equal(['config']);
  });
});
