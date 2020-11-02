const crypto = require("crypto")
const argv = require('minimist')(process.argv)

module.exports = {
  // Port the server is listening on
  port: argv.port || process.env.PORT || 3000,

  // Key for encrypting and decrypting the jwt token
  secret: argv.secret || process.env.JWT_SECRET || crypto.randomBytes(256).toString("base64"),

  // By default all teamspeak servers are accepted
  // This can be changed by providing an ip list
  whitelist: argv.whitelist && argv.whitelist.split(",") || [],
}
