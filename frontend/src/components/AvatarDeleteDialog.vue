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
    client: Object,
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
      let avatar = this.avatarList.find(client => client.cldbid === this.client.client_database_id)

      if(avatar) {
        return URL.createObjectURL(avatar.avatar)
      } else {
        return
      }
    }
  },
  methods: {
    deleteAvatar() {
      console.log("do something");
    }
  }
}
</script>

<style lang="css" scoped>
</style>
