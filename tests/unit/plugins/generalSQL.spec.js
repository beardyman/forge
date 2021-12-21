
describe('General SQL interface plugin', function() {
  let plugin;

  beforeEach(async function() {
    const Plugin = await esmock('../../../../plugins/generalSQL.js', {
      '../../../plugins/plugin.js': sinon.stub()
    });

    plugin = new Plugin({schema: 'mySchema', migrationTable: 'migs'});
  });

  it('should setup some config settings on `this`', async function() {
    expect(plugin.schema).to.equal('mySchema');
    expect(plugin.migrationTable).to.equal('migs');
  });

});