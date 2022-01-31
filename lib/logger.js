
import pino from 'pino';
import { config } from './config.js';

export let log;

export function initializeLogger() {
  log = pino({ name: 'Forge', level: config.logLevel });
}
