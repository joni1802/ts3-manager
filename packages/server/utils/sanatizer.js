/**
 * Removes non valid characters for the hostname input.
 * Only allow characters for domain names, IPv4 and IPv6 addresses.
 * E.g.:
 * - Domain: example-domain.com
 * - IPv4: 192.168.0.1
 * - IPv6: 2201:0fe9:0000:0000:0000:0000:0000:0001
 * @param {String} input
 * @returns {String}
 */
const sanatizeHostname = function (input) {
  const host = input.replace(/[^A-Za-z0-9.:-]/g, "");

  // The ts3-nodejs-library tries to connect to 127.0.0.1 if the host property is empty.
  // For security reasons this is not allowed.
  if (!host) {
    throw new Error("Missing servername");
  }

  return host;
};

/**
 * Removes non valid characters for the username.
 * @param {String} input
 * @returns {String}
 */
const sanatizeUsername = function (input) {
  return input.replace(/[^A-Za-z]/g, "");
};

/**
 * Removes non valid characters for the query port.
 * @param {String|Number} input
 * @returns {String|Number}
 */
const sanatizePort = function (input) {
  if (typeof input === "number") {
    return input;
  }

  return input.replace(/[^0-9]/g, "");
};

/**
 * Checks protocol.
 * @param {String} input
 * @returns {String}
 */
const sanatizeProtocol = function (input) {
  if (input.toLowerCase() === "ssh" || input.toLowerCase() === "raw") {
    return input;
  } else {
    throw new Error("Unsupported protocol");
  }
};

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Options
 * @property {String} host
 * @property {String|Number} queryport
 * @property {String} protocol
 * @property {String} username
 * @property {String} password
 */

/**
 * Sanatize all inputs from the login page which are used to connect to the TeamSpeak server.
 * @param {Options} options
 * @returns {Options}
 */
const sanatizeOptions = function (options) {
  return {
    host: sanatizeHostname(options.host),
    queryport: sanatizePort(options.queryport),
    protocol: sanatizeProtocol(options.protocol),
    username: sanatizeUsername(options.username),
    password: options.password,
  };
};

module.exports = {
  sanatizeOptions,
};
