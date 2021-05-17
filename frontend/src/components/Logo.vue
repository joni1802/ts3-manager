<template lang="html">
  <v-list-item two-line>
    <v-list-item-avatar class="rounded-0" width="40" height="40">
      <img src="@/assets/ts3_manager_logo.svg" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>TS3 Manager</v-list-item-title>
      <v-list-item-subtitle>{{ version }}</v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import { version } from "../../package.json";

export default {
  data() {
    return {
      version,
    };
  },
};
</script>
