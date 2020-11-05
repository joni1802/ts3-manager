<template lang="html">
  <v-list-item @click="$emit('click', client)">
    <v-list-item-avatar>
      <v-icon v-if="!avatarURL" class="accent" dark>person</v-icon>
      <v-img v-else :src="avatarURL"></v-img>
    </v-list-item-avatar>
    <v-badge color="error" :value="!!badgeValue">
      <template #badge>
        {{ badgeValue }}
      </template>
      <v-list-item-content>
        <v-list-item-title>
          {{ client.client_nickname }} <v-icon>{{ statusIcon }}</v-icon>
        </v-list-item-title>
      </v-list-item-content>
    </v-badge>
  </v-list-item>
</template>

<script>
export default {
  props: {
    client: Object,
    avatarList: Array,
    badgeValue: {
      type: [String, Number],
      default: 0
    }
  },
  computed: {
    statusIcon() {
      if (this.client.client_away === 1) {
        return 'cancel_presentation'
      } else if (this.client.client_output_muted === 1) {
        return 'volume_off'
      } else if (this.client.client_input_muted === 1) {
        return 'mic_off'
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
}
</script>

<style lang="css" scoped>
</style>
