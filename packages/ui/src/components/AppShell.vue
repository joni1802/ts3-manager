<template>
  <div>
    <v-app-bar app>
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        v-if="connected"
      ></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <dark-mode-switch></dark-mode-switch>
      <file-upload-icon v-if="connected"></file-upload-icon>
      <bell-icon v-if="connected"></bell-icon>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer" v-if="connected" width="300">
      <v-list dense class="pt-2" subheader nav>
        <logo></logo>
        <v-divider></v-divider>

        <!-- Avoid v-if with v-for https://v3.vuejs.org/style-guide/#avoid-v-if-with-v-for-essential -->
        <template v-for="(entry, i) in menuEntries">
          <v-list-item
            :key="i"
            v-if="!entry.submenu"
            @click="pushRoute(entry)"
            :class="{ 'v-list-item--active': $route.name === entry.route.name }"
          >
            <v-list-item-icon>
              <v-badge
                color="error"
                :value="entry.title === 'Chat' && $store.getters.unreadMessages"
              >
                <template #badge>
                  <span>{{ $store.getters.unreadMessages }}</span>
                </template>
                <v-icon>{{ entry.icon }}</v-icon>
              </v-badge>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ entry.title }}
                <v-icon v-if="entry.experimental">mdi-test-tube</v-icon>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-group v-else :key="i" no-action :prepend-icon="entry.icon">
            <template #activator>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ entry.title }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item
              v-for="(subEntry, j) in entry.submenu"
              :key="j"
              @click="pushRoute(subEntry)"
              :class="{
                'v-list-item--active': $route.name === subEntry.route.name,
              }"
            >
              <v-list-item-icon>
                <v-icon>{{ subEntry.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  {{ subEntry.title }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  components: {
    DarkModeSwitch: () => import("@/components/DarkModeSwitch"),
    BellIcon: () => import("@/components/BellIcon"),
    FileUploadIcon: () => import("@/components/FileUploadIcon"),
    Logo: () => import("@/components/Logo"),
    ServerSelection: () => import("@/components/ServerSelection"),
  },
  data() {
    return {
      mini: true,
      drawer: null,
      menuEntries: [
        {
          title: "Server List",
          icon: "dns",
          route: { name: "servers" },
        },
        {
          title: "Server Viewer",
          icon: "remove_red_eye",
          route: { name: "serverviewer" },
        },
        {
          title: "Chat",
          icon: "mail_outline",
          route: { name: "chat" },
        },
        {
          title: "File Browser",
          icon: "mdi-folder",
          route: { name: "files" },
        },
        {
          title: "Server Log",
          icon: "mdi-file-document-outline",
          route: { name: "logs" },
        },
        {
          title: "Backup/Restore",
          icon: "settings_backup_restore",
          route: { name: "snapshot" },
        },
        {
          title: "Server Query",
          icon: "mdi-console",
          route: { name: "console" },
        },
        {
          title: "Privilege Keys",
          icon: "mdi-key",
          route: { name: "tokens" },
        },
        {
          title: "API Keys",
          icon: "mdi-shield-key",
          route: { name: "apikeys" },
        },
        {
          title: "Ban List",
          icon: "not_interested",
          route: { name: "bans" },
        },
        {
          title: "Complaints List",
          icon: "warning",
          route: { name: "complaints" },
        },

        {
          title: "List All Clients",
          icon: "person",
          route: { name: "clients" },
        },
        {
          title: "Server Groups",
          icon: "group",
          route: { name: "servergroups" },
        },
        {
          title: "Channel Groups",
          icon: "mdi-hexagon-slice-4",
          route: { name: "channelgroups" },
        },
        {
          title: "Permissions",
          icon: "mdi-format-section",
          submenu: [
            {
              title: "Server Group",
              icon: "group",
              route: { name: "permissions-servergroup" },
            },
            {
              title: "Client Permissions",
              icon: "person",
              route: { name: "permissions-client" },
            },
            {
              title: "Channel Permissions",
              icon: "mdi-hexagon-slice-4",
              route: { name: "permissions-channel" },
            },
            {
              title: "Channel Groups",
              icon: "mdi-hexagon-slice-4",
              route: { name: "permissions-channelgroup" },
            },
            {
              title: "Channel Client Permissions",
              icon: "mdi-hexagon-slice-4",
              route: { name: "permissions-channelclient" },
            },
          ],
        },
        {
          title: "Logout",
          icon: "exit_to_app",
          route: { name: "logout" },
        },
      ],
    };
  },
  computed: {
    connected() {
      return this.$store.state.query.connected;
    },
  },
  methods: {
    pushRoute(entry) {
      if (entry.route.name !== this.$route.name) {
        this.$router.push(entry.route);
      }
    },
  },
};
</script>
