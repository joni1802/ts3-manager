const winston = require('winston')
const path = require('path')

// If there is a query parameter which contains a password, it will be not logged in clear text.
// E.g channeledit channel_password=**** cid=5
const hidePasswords = winston.format(info => {
  let password = /password/
  let queryParams = info.message.params

  for(let prop in queryParams) {
    // Replaces password with *
    if(password.test(prop)) queryParams[prop] = '*'.repeat(queryParams[prop].length)
  }

  return info
})

const myFormat = winston.format.printf(({level, message, label, timestamp, client}) => {
  return `${timestamp} | ${client} | ${level.toUpperCase()} | ${message}`;
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    hidePasswords(),
    myFormat
  ),
  transports: [
    // Save log files and show them in the console
    new winston.transports.File({
      // Using process.cwd instead of __dirname because the executable is using the folder snapshot
      // See more under https://github.com/zeit/pkg#snapshot-filesystem
      // A relativ path like './combined.log' would also work but is not that clean
      filename: path.join(process.cwd(), 'combined.log'),
      maxsize: 10000000, // 10 MB
      maxFiles: 1
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'error.log'),
      level: 'error',
      maxsize: 10000000, // 10 MB
      maxFiles: 1
    }),
    new winston.transports.Console()
  ]
})


module.exports = logger
