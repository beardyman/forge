
describe('Migration State Model', function() {
  let model, plugin;

  before(async function() {
    plugin = {
      createSchema: sinon.stub().resolves(),
      createTable: sinon.stub().resolves(),
      insert: sinon.stub().resolves(),
      remove: sinon.stub().resolves(),
      getMigrationState: sinon.stub().resolves('state')
    };

    model = await esmock('../../../../lib/model/migrationState.js', {
      '../../../../lib/config': {schema: 'nimbus'},
      '../../../../lib/logger': {info: sinon.stub()},
      '../../../../lib/model/plugin': {default: sinon.stub().returns(plugin)}
    });
  });

  it('should initialize the schema and table for managing migration state', async function() {
    await model.initialize();
    expect(plugin.createSchema.callCount).to.equal(1);
    expect(plugin.createSchema.args[0][0]).to.equal('nimbus');
    expect(plugin.createTable.callCount).to.equal(1);
    expect(plugin.createTable.args[0][0]).to.deep.equal({
      version: 'text',
      name: 'text',
      filename: 'text'
    });
  });

  it('should get the current state', async function() {
    const state = await model.getCurrentState();
    expect(plugin.getMigrationState.callCount).to.equal(1);
    expect(state).to.equal('state');
  });

  it('should add to the current state', async function() {
    await model.recordMigration('migs');
    expect(plugin.insert.callCount).to.equal(1);
    expect(plugin.insert.args[0][0]).to.equal('migs');
  });

  it('should remove from the current state', async function() {
    await model.removeMigration('migs');
    expect(plugin.remove.callCount).to.equal(1);
    expect(plugin.remove.args[0][0]).to.equal('migs');
  });
});