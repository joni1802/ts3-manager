import socket from '../socket'

/**
 * The TeamSpeak Object sends the request to the server and finally receives the response from the ServerQuery.
 * To keep things simple it uses the same naming as the TeamSpeak class from the TS3-NodeJS-Library which is used on the server side.
 * See: https://multivit4min.github.io/TS3-NodeJS-Library/classes/teamspeak.html
 * @type {Object}
 */

const TeamSpeak = {}

TeamSpeak.connect = params => {
  return new Promise((resolve, reject) => {
    socket.emit('teamspeak_connect', params, response => {
      if(response.token) {
        resolve(response)
      } else {
        reject(response)
      }
    })
  })
}

TeamSpeak.execute = (command, params = {}, options = []) => {
  return new Promise((resolve, reject) => {
    socket.emit('execute', {command, params, options}, response => {
      // If the response is an object with an ID it is a ServerQuery error.
      if(response.id && response.id !== 0) {

        // If it is just an empty results error return an empty array. Otherwise the code would break.
        // This response is often received when you get e.g. an empty permissionlist.
        if(response.id === 1281) {
          resolve([])
        } else {
          reject(response)
        }
      } else if(!response.id && response.message) { // General Error
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
}

TeamSpeak.createSnapshot = () => {
  return new Promise((resolve, reject) => {
    socket.emit('createsnapshot', response => {
      if(response.snapshot) {
        resolve(response)
      } else {
        reject(response)
      }
    })
  })
}

TeamSpeak.deploySnapshot = snapshot => {
  return new Promise((resolve, reject) => {
    socket.emit('deploysnapshot', snapshot, response => {
      if(response.message) {
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
}

// The ServerQuery returns maximum 200 entries in the clientdblist.
// This function collects all available entries in the client database list.
TeamSpeak.fullClientDBList = async () => {
  let fullClientDbList = []
  let start = 0
  let duration = 200

  try {
    while((await TeamSpeak.execute('clientdblist', {start, duration})).length) {
      fullClientDbList.push(...(await TeamSpeak.execute('clientdblist', {start, duration})))

      start += 200
      duration += 200
    }
  } catch(err) {
    throw err
  }

  return fullClientDbList
}

export default TeamSpeak
