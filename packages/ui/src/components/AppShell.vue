<template>
  <div>
    <v-app-bar app>
      <v-app-bar-nav-icon
        @click="toggleDrawer"
        v-if="connected"
      ></v-app-bar-nav-icon>
      <v-spacer></v-spacer>

      <dark-mode-switch></dark-mode-switch>
      <file-upload-icon v-if="connected"></file-upload-icon>
      <bell-icon v-if="connected"></bell-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app :width="drawerWidth">
      <v-navigation-drawer
        v-model="nestedDrawer"
        absolute
        color="secondary darken-1"
        mini-variant
        stateless
      >
        <!-- <div class="d-flex justify-center">
          <v-btn icon x-large class="my-2" :to="{ name: 'servers' }">
            <v-avatar rounded size="36">
              <img src="@/assets/ts3_manager_logo.svg" />
            </v-avatar>
          </v-btn>
        </div> -->

        <v-list-item class="px-2">
          <v-list-item-avatar tile>
            <img src="@/assets/ts3_manager_logo.svg" />
          </v-list-item-avatar>
        </v-list-item>

        <v-divider class="mx-3"></v-divider>

        <div class="pa-2" v-for="entry in navigation">
          <v-btn dark text fab small :to="entry.route">
            <v-icon>{{ entry.icon }}</v-icon>
          </v-btn>
        </div>
        <!-- <div class="pa-2">
          <v-btn dark text fab small :to="{ name: 'console' }">
            <v-icon>mdi-console</v-icon>
          </v-btn>
        </div>
        <div class="pa-2">
          <v-btn dark text fab small :to="{ name: 'test' }">
            <v-icon>science</v-icon>
          </v-btn>
        </div> -->

        <v-divider class="mx-3 mb-2"></v-divider>

        <div
          class="d-flex justify-center mb-2"
          v-for="server in serverList"
          :key="server.virtualserver_id"
        >
          <v-btn
            icon
            x-large
            :to="{ name: 'server', params: { sid: server.virtualserver_id } }"
            :disabled="
              serverId === server.virtualserver_id ||
              server.virtualserver_status === 'offline'
            "
            active-class="server--active"
            :class="
              serverId === server.virtualserver_id ? 'server--active' : ''
            "
          >
            <v-avatar size="36" color="info">
              <span v-if="true">{{
                server.virtualserver_name.substring(0, 2).toUpperCase()
              }}</span>
              <v-img
                v-else
                src="https://upload.wikimedia.org/wikipedia/commons/3/32/Telefunken_FuBK_test_pattern.svg"
                class="rounded-xl"
              ></v-img>
            </v-avatar>
          </v-btn>
        </div>
        <div class="pa-2">
          <v-btn color="primary" fab small>
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>

        <template #append>
          <div class="pa-2">
            <v-btn dark text fab small :to="{ name: 'logout' }">
              <v-icon>logout</v-icon>
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <v-list class="pl-14" v-if="drawerWidth === '300'" dense>
        <template v-for="(entry, i) in serverNavigation">
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
      drawerWidth: "300",
      nestedDrawer: true,
      navigation: [
        {
          icon: "dns",
          route: { name: "servers" },
        },
        {
          icon: "mdi-console",
          route: { name: "console" },
        },
        {
          icon: "mdi-shield-key",
          // route: { name: "apikeys" },
        },
        {
          icon: "science",
          route: { name: "test" },
        },
      ],
    };
  },
  computed: {
    connected() {
      return this.$store.state.query.connected;
    },
    serverId() {
      return this.$store.state.query.serverId;
    },
    serverList() {
      return this.$store.state.query.serverList;
    },
    serverNavigation() {
      return [
        {
          title: "Dashboard",
          icon: "dashboard",
          route: {
            name: "dashboard",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Edit Virtual Server",
          icon: "build",
          route: { name: "server-edit", params: { sid: this.serverId } },
        },
        {
          title: "Server Viewer",
          icon: "remove_red_eye",
          route: {
            name: "serverviewer",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Chat",
          icon: "mail_outline",
          route: {
            name: "chat",
            params: { sid: this.serverId },
          },
        },
        {
          title: "File Browser",
          icon: "mdi-folder",
          route: {
            name: "files",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Server Log",
          icon: "mdi-file-document-outline",
          route: {
            name: "logs",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Backup/Restore",
          icon: "settings_backup_restore",
          route: {
            name: "snapshot",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Privilege Keys",
          icon: "mdi-key",
          route: {
            name: "tokens",
            params: { sid: this.serverId },
          },
        },
        {
          title: "API Keys",
          icon: "mdi-shield-key",
          route: {
            name: "apikeys",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Ban List",
          icon: "not_interested",
          route: {
            name: "bans",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Complaints List",
          icon: "warning",
          route: {
            name: "complaints",
            params: { sid: this.serverId },
          },
        },

        {
          title: "List All Clients",
          icon: "person",
          route: {
            name: "clients",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Server Groups",
          icon: "group",
          route: {
            name: "servergroups",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Channel Groups",
          icon: "mdi-hexagon-slice-4",
          route: {
            name: "channelgroups",
            params: { sid: this.serverId },
          },
        },
        {
          title: "Permissions",
          icon: "mdi-format-section",
          submenu: [
            {
              title: "Server Group",
              icon: "group",
              route: {
                name: "permissions-servergroup",
                params: { sid: this.serverId },
              },
            },
            {
              title: "Client Permissions",
              icon: "person",
              route: {
                name: "permissions-client",
                params: { sid: this.serverId },
              },
            },
            {
              title: "Channel Permissions",
              icon: "mdi-hexagon-slice-4",
              route: {
                name: "permissions-channel",
                params: { sid: this.serverId },
              },
            },
            {
              title: "Channel Groups",
              icon: "mdi-hexagon-slice-4",
              route: {
                name: "permissions-channelgroup",
                params: { sid: this.serverId },
              },
            },
            {
              title: "Channel Client Permissions",
              icon: "mdi-hexagon-slice-4",
              route: {
                name: "permissions-channelclient",
                params: { sid: this.serverId },
              },
            },
          ],
        },
      ];
    },
  },
  methods: {
    pushRoute(entry) {
      if (entry.route.name !== this.$route.name) {
        this.$router.push(entry.route);
      }
    },
    toggleDrawer() {
      this.drawer = !this.drawer;
      this.nestedDrawer = true;
    },
  },
  watch: {
    serverId: {
      immediate: true,
      handler(serverId) {
        console.log("serverid", serverId);
        if (serverId) {
          this.drawerWidth = "300";
        } else {
          this.drawerWidth = "56";
        }
      },
    },
  },
};
</script>

<style scoped>
.server--active {
  border: solid 0.25rem white;
}
</style>
