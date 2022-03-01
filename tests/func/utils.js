

/**
 * Helps building the argv that the cli expects
 *
 * @param command
 * @param name
 * @param version
 * @returns {{version, _: *[]}}
 */
export function cliParamBuilder({ command, name, version }) {
  return { _: [ command, name ], version };
}
