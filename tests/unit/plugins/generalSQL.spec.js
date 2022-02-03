
import '../bootstrap.js';


describe('General SQL interface plugin', function() {
  let plugin;

  beforeEach(async function() {
    const Plugin = await esmock('../../../plugins/generalSQL.js', {
      '../../../plugins/pluginInterface.js': sinon.stub()
    });

    plugin = new Plugin({schema: 'mySchema', migrationTable: 'migs'});
  });

  it('should setup some config settings on `this`',  function() {
    expect(plugin.schema).to.equal('mySchema');
    expect(plugin.fQTable).to.equal('mySchema.migs');
  });

  it('should throw an error if this.db.query is not defined', function() {
    expect(plugin.db.query).to.throw('Forge Plugin Error - `this.db` must have a query function');
  });

  it('moar tests', function(){

  });
});
