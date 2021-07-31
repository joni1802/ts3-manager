<template lang="html">
  <v-card>
    <v-card-title>{{ serverInfo.virtualserver_name }}</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>IP Address:</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            {{ serverInfo.virtualserver_ip }}
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Version:</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>{{
            serverInfo.virtualserver_version
          }}</v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Uptime:</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>{{
            serverInfo.virtualserver_uptime
          }}</v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Platform:</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>{{
            serverInfo.virtualserver_platform
          }}</v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Total Bytes Downloaded:</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>{{
            serverInfo.virtualserver_total_bytes_downloaded
          }}</v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Total Bytes Uploaded:</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>{{
            serverInfo.virtualserver_total_bytes_uploaded
          }}</v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    serverInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
</script>

<style lang="css" scoped></style>
