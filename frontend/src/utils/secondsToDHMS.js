// Converts seconds to the next best human readable time unit.
// Bitwise Operators is used to truncate the result.

const secondsToDHMS = (seconds) => {
  return {
    days: (seconds / 86400) >> 0,
    hours: (seconds % 86400 / 3600) >> 0,
    minutes: (seconds % 3600 / 60) >> 0,
    seconds: (seconds % 60) >> 0,
  }
}

export default secondsToDHMS
