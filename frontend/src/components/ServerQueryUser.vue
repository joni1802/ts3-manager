<template lang="html">
  <v-list-item two-line @click="">
    <v-list-item-avatar>
      <img ref="avatar" class="avatar">
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ queryUser.client_login_name }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ queryUser.client_nickname }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
// https://github.com/danielgjackson/sprite
import Sprite from '@/utils/sprite.mjs'

export default {
  data() {
    return {
      queryUser: {}
    }
  },
  methods: {
    getQueryUserInfo() {
      return this.$TeamSpeak.execute("whoami").then(list => list[0])
    },
    renderImage(seed) {
      this.$nextTick(() => {
        let spriteUri = Sprite.generate(seed).asDataUri()

        this.$refs.avatar.src = spriteUri
      })
    }
  },
  async created() {
    try {
      this.queryUser = await this.getQueryUserInfo()
    } catch(err) {
      this.$toasted.error(err.message)
    }

    this.renderImage(this.queryUser.client_login_name)
  }
}
</script>

<style lang="css" scoped>
  .avatar {
    image-rendering: auto;
    image-rendering: crisp-edges; /* Firefox */
    image-rendering: pixelated; /* Chromium */
  }
</style>
