#!/usr/bin/env node

// disable no-console rule for this file since our normal logger needs to read in config to work.
/* eslint-disable no-console */
import min from 'minimist';
import updateNotifier from 'update-notifier';
import cli from '../cli.js';

// check for updates
import { createRequire } from 'module';
const require = createRequire( import.meta.url );
const pkg = require( '../package.json' );
updateNotifier({ pkg }).notify();

const argv = min( process.argv.slice( 2 ));
try {
  await cli( argv );
  process.exit( 0 );
} catch ( error ) {
  console.fatal( error );
  process.exit( 255 );
}

process.on( 'uncaughtException', ( error ) => {
  console.fatal( error );
  process.exit( 255 );
});

process.on( 'unhandledRejection', ( reason ) => {
  console.fatal( reason );
  process.exit( 255 );
});
