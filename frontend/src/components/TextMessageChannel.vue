<template lang="html">
  <v-list-item @click="$emit('click', channel)">
    <v-list-item-avatar>
      <v-icon large>mdi-hexagon-slice-4</v-icon>
    </v-list-item-avatar>
      <v-badge color="error" :value="!!badgeValue">
        <template #badge>
          {{ badgeValue }}
        </template>
        <v-list-item-content>
          <v-list-item-title>{{ channel.channel_name }}</v-list-item-title>
          <v-list-item-subtitle>{{ channel.cid }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-badge>
  </v-list-item>
</template>

<script>
export default {
  props: {
    badgeValue: {
      type: [Number, String],
      default: 0
    },
    channel: Object
  }
}
</script>

<style lang="css" scoped>
</style>
