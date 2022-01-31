
import _ from 'lodash';
import '../../bootstrap.js';

describe('Migrations Model', function() {
  let model, fs, findUp;

  beforeEach(async function() {
    fs = {
      readdir: sinon.stub().resolves()
    };

    findUp = sinon.stub().resolves('somePath');

    model = await esmock('../../../../lib/model/migrations.js', {
      '../../../../lib/config': {config: { my: 'config'}},
      'fs/promises': fs,
      'find-up': {findUp}
    });
  });

  it('should throw an error if we can\'t find the directory to read migrations', async function() {
    findUp.resolves();
    const err = await expect(model.getMigrationFiles()).to.eventually.be.rejected();

    expect(err.message).to.equal('Path configuration for \'migrationsDirectory\' cannot be found. (value: undefined)');
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
