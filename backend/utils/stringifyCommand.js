const stringifyCommand = (command, params, options) => {
  let fullCommand = `${command} `

  for(let [prop, value] of Object.entries(params)) {
    fullCommand += `${prop}=${value} `
  }

  for(let value of options) {
    fullCommand += `${value} `
  }

  return fullCommand
}

module.exports = stringifyCommand
