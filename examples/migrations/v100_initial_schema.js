/**
 * Migration files need to export two functions, migrate and rollback.
 *
 * In those functions you can run whatever is necessary to run the migration or rollback.
 * If you can do it in nodejs, it can run as part of this migration.
 */

export function migrate() {
  console.log( 'running version 100' );
}

export function rollback() {
  console.log( 'rolling back version 100' );
}
