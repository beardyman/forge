
import _ from 'lodash';
import '../../bootstrap.js';
import actionTypes from '../../../../lib/actionTypes.js';

describe( 'Migrations Model', function() {
  let model, fs, findUp, path, loadUserModule, migrate;

  beforeEach( async function() {
    fs = {
      readdir: sinon.stub().resolves()
    };

    findUp = sinon.stub().resolves( 'somePath' );
    path = {
      resolve: sinon.stub()
    };

    const log = {
      info: sinon.stub()
    };

    migrate = sinon.stub();
    loadUserModule = sinon.stub().resolves({ migrate });

    model = await esmock( '../../../../lib/model/migrations.js', {
      '../../../../lib/config': { config: { my: 'config' }},
      'fs/promises': fs,
      'find-up': { findUp },
      '../../../../lib/logger': { log },
      '../../../../lib/fileUtilities': { loadUserModule },
      path
    });
  });

  describe( 'getMigrationFiles', function() {
    it( 'should throw an error if we can\'t find the directory to read migrations', async function() {
      findUp.resolves();
      const err = await expect( model.getMigrationFiles()).to.eventually.be.rejected();

      expect( err.message ).to.equal( 'Path configuration for \'migrationsDirectory\' cannot be found. (value: undefined)' );
    });

    it( 'shouldn\'t return any files if there are none', async function() {
      const files = await model.getMigrationFiles();
      expect( _.isArray( files )).to.equal( true );
      expect( files.length ).to.equal( 0 );
    });

    it( 'should get migration files', async function() {
      fs.readdir.resolves([ 'v1_migration.js', 'v2_migration.js' ]);

      const files = await model.getMigrationFiles();
      expect( _.isArray( files )).to.equal( true );
      expect( files.length ).to.equal( 2 );
    });

    it( 'should only get migration files matching the v###_###.js schema', async function() {
      fs.readdir.resolves([ 'v1_migration.js', 'v2_migration.js', 'something else', 'another.js' ]);

      const files = await model.getMigrationFiles();
      expect( _.isArray( files )).to.equal( true );
      expect( files.length ).to.equal( 2 );
    });
  });

  describe( 'parseFileNames', function() {
    it( 'should parse a file name for number versions', function() {
      const results = model.parseFileName( 'v1_a_b_c.js' );
      expect( results ).to.deep.equal({ version: '1', name: 'a b c', filename: 'v1_a_b_c.js' });
    });

    it( 'should parse a file name for named versions', function() {
      const results = model.parseFileName( 'vhi_a_b_c.js' );
      expect( results ).to.deep.equal({ version: 'hi', name: 'a b c', filename: 'vhi_a_b_c.js' });
    });

    it( 'should parse a file name for date versions', function() {
      const results = model.parseFileName( 'v2022-01-05_a_b_c.js' );
      expect( results ).to.deep.equal({ version: '2022-01-05', name: 'a b c', filename: 'v2022-01-05_a_b_c.js' });
    });
  });

  describe( 'loadAction', function() {
    const config = { migrationsDirectory: '../../test/mocks/migrations' };

    beforeEach( async function() {
      path.resolve.returns( `${config.migrationsDirectory}/${'v1_a.js'}` );
    });


    it( 'should run a mock migration', async function() {

      const action = await model.loadAction( config, 'v1_a.js', actionTypes.migrate );
      expect( path.resolve.callCount ).to.equal( 1 );
      expect( loadUserModule.callCount ).to.equal( 1 );
      expect( loadUserModule.args[0][0]).to.equal( '../../test/mocks/migrations/v1_a.js' );
      // ensure that it returns migrate
      expect( action.callCount ).to.equal( 0 );
      migrate(); // stub setup above returned from loadUserModule
      expect( action.callCount ).to.equal( 1 );
    });
  });
});
