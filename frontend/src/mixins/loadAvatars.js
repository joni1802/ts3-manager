/**
 * An array with the downloaded image files of all clients.
 * This images are downloaded from the server.
 * @typedef {Array} ClientAvatars
 * @property {Number} cldbid        - client database id
 * @property {Blob} avatar          - downloaded image from the server
 * @property {(Number|Undefined)} clid - current client id (if the client is not online it is undefined)
 */

export default {
  data() {
    return {
      /**
       * @type {ClientAvatars}
       */
      clientAvatars: []
    }
  },
  methods: {
    addConnectionListeners() {
      this.$TeamSpeak.on('clientconnect', this.loadSingleClientAvatar)
      this.$TeamSpeak.on('clientdisconnect', this.removeSingleClientAvatar)
    },
    removeConnectionListeners() {
      this.$TeamSpeak.__proto__.removeEventListener('clientconnect', this.loadSingleClientAvatar)
      this.$TeamSpeak.__proto__.removeEventListener('clientdisconnect', this.removeSingleClientAvatar)
    },
    getClientDbInfo(clientDbId) {
      return this.$TeamSpeak.execute("clientdbinfo", {
        cldbid: clientDbId
      }).then(info => info[0])
    },
    getClientId(clientUiD) {
      return this.$TeamSpeak.execute("clientgetids", {
        cluid: clientUiD
      }).then(result => {
        return result.length ? result[0].clid : undefined
      })
    },
    downloadFile(path, cid, cpw) {
      return this.$TeamSpeak.downloadFile(path, cid, cpw)
    },
    async loadClientAvatars(clientDbIdList) {
      for(let clientDbId of clientDbIdList) {
        try {
          // The serveradmin has no database data
          if(clientDbId !== 1) {
            let clientDbInfo = await this.getClientDbInfo(clientDbId)
            let clientId = await this.getClientId(clientDbInfo.client_unique_identifier)

            // If client has an avatar
            if(clientDbInfo.client_flag_avatar) {
              let fileName = `avatar_${clientDbInfo.client_base64HashClientUID}`
              let filePath = `/${fileName}`
              let buffer = await this.downloadFile(filePath, 0)

              this.clientAvatars.push({
                cldbid: clientDbId,
                avatar: new Blob([new Uint8Array(buffer.data)]),
                // clid is needed for removing the data when the client disconnects
                clid: clientId,
              })
            }

          }
        } catch(err) {
          this.$toasted.error(err.message)
        }
      }
    },
    loadSingleClientAvatar(e) {
      let client = e.detail.client

      this.loadClientAvatars([client.client_database_id])
    },
    removeSingleClientAvatar(e) {
      let clientId = e.detail.client.clid
      let index = this.clientAvatars.findIndex(client => client.clid === clientId)

      if(index > 0) {
        this.clientAvatars.splice(index, 1)
      }
    }
  },
  created() {
    this.addConnectionListeners()
  },
  beforeRouteLeave(from, to, next) {
    this.removeConnectionListeners()

    next()
  }
}
