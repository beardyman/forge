#!/usr/bin/env node

import min from 'minimist';
import cli from '../cli.js';

const argv = min(process.argv.slice(2), {
  aliases: {
    force: 'f',
    version: 'v'
  }
});

await cli(argv);
process.exit(0);

process.on('uncaughtException', (error) => {
  console.error(error);
  process.exit(255);
});

process.on('unhandledRejection', (reason) => {
  console.error(reason);
  process.exit(255);
});
