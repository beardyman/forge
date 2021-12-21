
import _ from 'lodash';

describe('Migrations Model', function() {
  let model, fs;

  beforeEach(async function() {
    fs = {
      readdir: sinon.stub().resolves()
    };

    model = await esmock('../../../../lib/model/migrations.js', {
      '../../../../lib/config': {my: 'config'},
      'fs/promises': fs
    });
  });

  it('shouldn\'t return any files if there are none', async function() {
    const files = await model.getMigrationFiles();
    expect(_.isArray(files)).to.equal(true);
    expect(files.length).to.equal(0);
  });

  it('should get migration files', async function() {
    fs.readdir.resolves(['v1_migration.js', 'v2_migration.js']);

    const files = await model.getMigrationFiles();
    expect(_.isArray(files)).to.equal(true);
    expect(files.length).to.equal(2);
  });

  it('should only get migration files matching the v###_###.js schema', async function() {
    fs.readdir.resolves(['v1_migration.js', 'v2_migration.js', 'something else', 'another.js']);

    const files = await model.getMigrationFiles();
    expect(_.isArray(files)).to.equal(true);
    expect(files.length).to.equal(2);
  });
});