<template>
  <nav>
    <v-btn icon @click="drawer = !drawer" class="hidden-lg-and-up"><v-icon>menu</v-icon></v-btn>
    <v-navigation-drawer app v-model="drawer">
      <v-toolbar
        flat
        class="transparent py-2"
      >
        <v-list>
          <v-list-tile>
            <v-list-tile-content>
              <img :class="{'logo--dark': $store.state.settings.darkMode}" src="@/assets/ts3_manager_text_new.svg"  />
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list dense class="pt-2">
        <v-list-tile v-for="(entry, i) in menuEntries" v-if="!entry.submenu" :key="i" :to="entry.path">
          <v-list-tile-action>
            <v-icon>{{ entry.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>
            {{ entry.title }}
          </v-list-tile-title>
        </v-list-tile>
        <v-list-group v-else value="true" :prepend-icon="entry.icon" active-class="" no-action>
          <template slot="activator">
            <v-list-tile>
              <v-list-tile-title>
                {{ entry.title }}
              </v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile v-for="(subEntry, j) in entry.submenu" :key="j" :to="subEntry.path" :exact="true">
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
</template>

<script>
  export default {
    data() {
      return {
        mini: true,
        drawer: null,
        menuEntries: [
          {
            title: 'Server List',
            icon: 'dns',
            path: '/servers',
          },
          {
            title: 'Backup/Restore',
            icon: 'settings_backup_restore',
            path: '/snapshot'
          },
          {
            title: 'Server Viewer',
            icon: 'remove_red_eye',
            path: '/serverviewer',
          },
          {
            title: 'List All Clients',
            icon: 'person',
            path: '/clients',
          },
          {
            title: 'Ban List',
            icon: 'not_interested',
            path: '/bans'
          },
          {
            title: 'Console',
            icon: 'mdi-console',
            path: '/console'
          },
          {
            title: 'Complaints List',
            icon: 'warning',
            path: '/complaints'
          },
          {
            title: 'Server Groups',
            icon: 'group',
            path: '/servergroups',
          },
          {
            title: 'Channel Groups',
            icon: 'chat_bubble',
            path: '/channelgroups'
          },
          {
            title: 'Permissions',
            icon: 'mdi-format-section',
            submenu: [
              {
                title: 'Server Group',
                icon: 'group',
                path: '/permissions/servergroup/6',
              },
              {
                title: 'Client Permissions',
                icon: 'person',
                path: '/permissions/client/2',
              },
              {
                title: 'Channel Permissions',
                icon: 'chat_bubble',
                path: '/permissions/channel/1',
              },
              {
                title: 'Channel Groups',
                icon: 'chat_bubble',
                path: '/permissions/channelgroup/5',
              },
              {
                title: 'Channel Client Permissions',
                icon: 'chat_bubble',
                path: '/permissions/channel/1/client/2',
              },
            ]
          },
          {
            title: 'Settings',
            icon: 'settings',
            path: '/settings'
          },
          {
            title: 'Logout',
            icon: 'exit_to_app',
            path: '/logout'
          }
        ],
      }
    }
  }
</script>

<style>
  .logo--dark {
    filter: brightness(10);
  }
</style>
