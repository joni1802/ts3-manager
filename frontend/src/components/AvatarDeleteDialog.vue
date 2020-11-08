<template lang="html">
  <v-dialog v-model="dialog" max-width="300px">
    <v-card>
      <v-img :src="avatarURL" />

      <v-card-title>Delete Avatar</v-card-title>
      <v-card-text>
        Do you really want to delete this avatar?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialog = false" color="primary">Cancel</v-btn>
        <v-btn text @click="deleteAvatar" color="primary">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    clientDbId: Number,
    avatarList: Array,
    value: Boolean
  },
  computed: {
    dialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit("input", val)
      }
    },
    avatarURL() {
      let avatar = this.avatarList.find(client => client.cldbid === this.clientDbId)

      if(avatar) {
        return URL.createObjectURL(avatar.avatar)
      } else {
        return
      }
    }
  },
  methods: {
    deleteFile(cid, name, cpw = "") {
      return this.$TeamSpeak.execute("ftdeletefile", {
        cid,
        cpw,
        name
      })
    },
    getClientDbInfo() {
      return this.$TeamSpeak.execute("clientdbinfo", {
        cldbid: this.clientDbId
      }).then(info => info[0])
    },
    async deleteAvatar() {
      try {
        let clientDbInfo = await this.getClientDbInfo()
        let fileName = `avatar_${clientDbInfo.client_base64HashClientUID}`
        let filePath = `/${fileName}`

        await this.deleteFile(0, filePath)

        this.dialog = false
      } catch(err) {
        this.$toasted.error(err.message)
      }

      this.$emit("avatardelete", this.clientDbId)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
