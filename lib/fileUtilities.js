/**
 * Loads a user's JS file.  Must be a ESM formatted file.
 *
 * @param {string} file - file path and name
 * @returns {Promise<Object>>} - module as run-able JS
 */
export const loadUserModule = ( file ) =>
  loadFile( process.platform === 'win32' ? `file://${file}` : file  );


/**
 * Loads a user's JS file.  Must be a ESM formatted file.
 *
 * @param {string} file - file path and name
 * @returns {Promise<*>}
 */
export let loadFile = ( file ) =>
  /*
  This is an abstraction to help unit test logic around importing files.
  There's potential for this to be replaced with NodeJS's vm.Module stuff but that's still experimental.
   */
  import( file );
