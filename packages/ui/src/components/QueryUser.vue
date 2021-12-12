<template>
  <v-menu bottom offset-y>
    <template #activator="{ on }">
      <v-btn icon x-large dark v-on="on">
        <v-avatar size="48" color="primary">
          <span>{{ loginNameShorthand }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Edit Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  computed: {
    loginNameShorthand() {
      return this.$store.state.query.queryUser.client_login_name
        .substring(0, 2)
        .toUpperCase();
    },
  },
};
</script>
