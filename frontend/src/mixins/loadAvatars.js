export default {
  data() {
    return {
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
    downloadFile(path, cid, cpw) {
      return this.$TeamSpeak.downloadFile(path, cid, cpw)
    },
    async loadClientAvatars(clients) {
      for(let client of clients) {
        try {
          // The serveradmin has no database data
          if(client.client_database_id !== 1) {
            let clientDbInfo = await this.getClientDbInfo(client.client_database_id)

            // If client has an avatar
            if(clientDbInfo.client_flag_avatar) {
              let fileName = `avatar_${clientDbInfo.client_base64HashClientUID}`
              let filePath = `/${fileName}`
              let buffer = await this.downloadFile(filePath, 0)

              this.clientAvatars.push({
                cldbid: client.client_database_id,
                avatar: new Blob([new Uint8Array(buffer.data)]),
                // clid is needed for removing the data when the client disconnects
                clid: client.clid,
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

      this.loadClientAvatars([client])
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
