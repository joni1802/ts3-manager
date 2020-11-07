const crypto = require("crypto")
const {program} = require("commander")

program.option("-p, --port <value>", "port the server is listening on")
program.option("-s, --secret <value>", "secret for decrypting and encrypting the token")
program.option("-w, --whitelist <value>", "comma separated ip list of TeamSpeak servers you can connect to", parseWhitelist)

program.parse(process.argv)

function parseWhitelist(value) {
  return value ? value.split(",") : false
}

// process order of the parameters: command line > environment variable > default value
module.exports = {
  port: program.port ? program.port : process.env.PORT || 3000,
  secret: program.secret ? program.secret : process.env.JWT_SECRET || crypto.randomBytes(256).toString("base64"),
  whitelist: program.whitelist ? program.whitelist :  parseWhitelist(process.env.WHITELIST) || [],
}
