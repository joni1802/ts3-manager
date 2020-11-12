const config = require("../config")

/**
 * Check if the domain or ip of the TeamSpeak server is whitelisted.
 * If the whitelist is empty, every connection is accepted.
 * @param  {String} host IP or domain of the TeamSpeak server
 * @return {Boolean}
 */
const check = host => {
  if(!config.whitelist.length || config.whitelist.includes(host)) {
    return true
  } else {
    throw new Error("TeamSpeak server is not whitelisted")
  }
}

module.exports = {
  check
}
