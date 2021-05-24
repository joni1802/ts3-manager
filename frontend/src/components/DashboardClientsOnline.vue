<!-- prettier-ignore -->
<template lang="html">
  <v-card>
    <v-card-title>
      Clients Online ({{ serverInfo.virtualserver_clientsonline }}/{{serverInfo.virtualserver_maxclients}})
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="client in clientList"
          :key="client.client_database_id"
        >
          <v-list-item-avatar>
            <client-avatar
              :clientDbId="client.client_database_id"
            ></client-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ client.client_nickname }}
              <!-- <v-icon>{{ statusIcon }}</v-icon> -->
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
// virtualserver_maxclients
export default {
  components: {
    ClientAvatar: () => import("@/components/ClientAvatar"),
  },
  props: {
    clientList: Array,
    serverInfo: Object,
  },
};
</script>

<style lang="css" scoped></style>
