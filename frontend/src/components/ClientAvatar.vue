<template lang="html">
  <div>
    <v-avatar @click.stop="openDialog">
      <v-icon v-if="!avatarURL" class="accent" dark>person</v-icon>
      <v-img v-else :src="avatarURL"></v-img>
    </v-avatar>

    <v-dialog v-model="dialog" max-width="300">
      <img :src="avatarURL" />
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    clientDbId: Number,
    clientAvatars: Array,
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {
    avatarURL() {
      let avatar = this.clientAvatars.find(client => client.cldbid === this.clientDbId)

      if(avatar) {
        return URL.createObjectURL(avatar.avatar)
      } else {
        return
      }
    }
  },
  methods: {
    openDialog() {
      if(this.avatarURL) {
        this.dialog = true
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
