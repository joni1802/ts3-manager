import socket from '../socket'

const query = (command, params = {}, options = []) => {
  return new Promise((resolve, reject) => {
    socket.emit('query TeamSpeak', {command, params, options}, response => {
      if(response.id && response.id !== 0) { // ServerQuery Error
        // If it is just an empty results error return an empty array.
        // Otherwise the code would break
        // This response is often received when you want a permissionlist like clientpermlist
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

export default query
