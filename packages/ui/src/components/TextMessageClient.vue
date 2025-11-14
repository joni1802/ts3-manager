<template lang="html">
  <v-list-item @click="$emit('click', client)">
    <v-list-item-avatar>
      <client-avatar :clientDbId="client.clientDatabaseId"> </client-avatar>
    </v-list-item-avatar>
    <v-badge color="error" :value="!!badgeValue">
      <template #badge>
        {{ badgeValue }}
      </template>
      <v-list-item-content>
        <v-list-item-title>
          {{ client.clientNickname }} <v-icon>{{ statusIcon }}</v-icon>
        </v-list-item-title>
      </v-list-item-content>
    </v-badge>
  </v-list-item>
</template>

<script>
export default {
  components: {
    ClientAvatar: () => import("@/components/ClientAvatar"),
  },
  props: {
    client: Object,
    badgeValue: {
      type: [String, Number],
      default: 0,
    },
  },
  computed: {
    statusIcon() {
      if (this.client.clientAway === 1) {
        return "cancel_presentation";
      } else if (this.client.clientOutputMuted === 1) {
        return "volume_off";
      } else if (this.client.clientInputMuted === 1) {
        return "mic_off";
      }
    },
  },
};
</script>

<style lang="css" scoped></style>
