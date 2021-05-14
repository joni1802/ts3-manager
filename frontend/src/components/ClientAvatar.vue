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
    clientDbId: Number
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {
    avatarURL() {
      let file = this.$store.state.avatars.files.find(file => file.clientDbId === this.clientDbId)

      if(file && file.base64) {
        return `data:image/png;base64, ${file.base64}`
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
