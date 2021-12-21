
import _ from 'lodash';

describe('General SQL interface plugin', function() {
  let plugin;

  beforeEach(async function() {
    const Plugin = await esmock('../../../../plugins/generalSQL.js', {
      '../../../plugins/plugin.js': sinon.stub()
    });

    plugin = new Plugin({schema: 'mySchema', migrationTable: 'migs'});
  });

  it('should setup some config settings on `this`', async function() {


    expect(_.isArray(files)).to.equal(true);
    expect(files.length).to.equal(0);
  });

});