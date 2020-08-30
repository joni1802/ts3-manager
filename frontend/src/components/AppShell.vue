<template>
<div>
  <v-toolbar dense text color="rgba(0, 0, 0, 0)">
    <v-toolbar-side-icon @click="drawer = !drawer" v-if="validPage"></v-toolbar-side-icon>
    <v-spacer></v-spacer>
    <dark-mode-switch></dark-mode-switch>
    <bell-icon v-if="$store.state.query.connected"></bell-icon>
  </v-toolbar>

  <nav v-if="validPage">
    <v-navigation-drawer app v-model="drawer">
      <v-toolbar text class="transparent py-2">
        <v-list>
          <v-list-tile>
            <v-list-tile-content>
              <img :class="{'logo--dark': $store.state.settings.darkMode}" src="@/assets/ts3_manager_text_new.svg" />
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list dense class="pt-2" subheader>
        <v-list-tile v-for="(entry, i) in menuEntries" v-if="!entry.submenu" :key="i" :to="entry.route" >
          <v-list-tile-action>
            <v-badge color="red">
              <template slot="badge" v-if="entry.title === 'Chat' && $store.getters.unreadMessages">
                <span>{{ $store.getters.unreadMessages }}</span>
              </template>
              <v-icon>{{ entry.icon }}</v-icon>
            </v-badge>

          </v-list-tile-action>
          <v-list-tile-title>
            {{ entry.title }}
            <v-icon v-if="entry.experimental">mdi-test-tube</v-icon>
          </v-list-tile-title>
        </v-list-tile>
        <v-list-group v-else :prepend-icon="entry.icon" active-class="" no-action>
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title>
                {{ entry.title }}
              </v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile v-for="(subEntry, j) in entry.submenu" :key="j" :to="subEntry.route" :exact="true">
            <v-list-tile-action>
              <v-icon>{{ subEntry.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>
              {{ subEntry.title }}
            </v-list-tile-title>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
  </nav>
</div>
</template>

<script>
export default {
  components: {
    DarkModeSwitch: () => import('@/components/DarkModeSwitch'),
    BellIcon: () => import('@/components/BellIcon')
  },
  data() {
    return {
      mini: true,
      drawer: null,
      menuEntries: [{
          title: 'Server List',
          icon: 'dns',
          route: {name: 'servers'},
        },
        {
          title: 'Backup/Restore',
          icon: 'settings_backup_restore',
          route: {name: 'snapshot'}
        },
        {
          title: 'Token',
          icon: 'mdi-key',
          route: {name: 'tokens'}
        },
        {
          title: 'Chat',
          icon: 'mail_outline',
          route: {name: 'chat'}
        },
        {
          title: 'Server Viewer',
          icon: 'remove_red_eye',
          route: {name: 'serverviewer'}
        },
        {
          title: 'List All Clients',
          icon: 'person',
          route: {name: 'clients'}
        },
        {
          title: 'Ban List',
          icon: 'not_interested',
          route: {name: 'bans'}
        },
        {
          title: 'Console',
          icon: 'mdi-console',
          route: {name: 'console'}
        },
        {
          title: 'Complaints List',
          icon: 'warning',
          route: {name: 'complaints'}
        },
        {
          title: 'Server Log',
          icon: 'mdi-file-document-outline',
          route: {name: 'logs'}
        },
        {
          title: 'Server Groups',
          icon: 'group',
          route: {name: 'servergroups'}
        },
        {
          title: 'Channel Groups',
          icon: 'chat_bubble',
          route: {name: 'channelgroups'}
        },
        {
          title: 'Permissions',
          icon: 'mdi-format-section',
          submenu: [{
              title: 'Server Group',
              icon: 'group',
              route: {name: 'permissions-servergroup'}
            },
            {
              title: 'Client Permissions',
              icon: 'person',
              route: {name: 'permissions-client'}
            },
            {
              title: 'Channel Permissions',
              icon: 'chat_bubble',
              route: {name: 'permissions-channel'}
            },
            {
              title: 'Channel Groups',
              icon: 'chat_bubble',
              route: {name: 'permissions-channelgroup'}
            },
            {
              title: 'Channel Client Permissions',
              icon: 'chat_bubble',
              route: {name: 'permissions-channelclient'}
            },
          ]
        },
        {
          title: 'Logout',
          icon: 'exit_to_app',
          route: {name: 'logout'}
        }
      ],
    }
  },
  computed: {
    validPage() {
      if (this.$route.name === 'login' || this.$route.name === '404') {
        return false
      } else {
        return true
      }
    },
    notServers() {
      if(!this.$route.name === 'servers') {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style>
.logo--dark {
  filter: brightness(10);
}
</style>
