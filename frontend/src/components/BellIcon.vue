<template>
  <v-menu offset-y :close-on-content-click="false">
    <template slot="activator">
      <v-btn icon>
        <v-badge color="red">
          <template slot="badge" v-if="countNotifications">
            <span>{{ countNotifications }}</span>
          </template>
            <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-tile v-if="!countNotifications">
          <v-list-tile-content>
            <v-list-tile-title>No Notifications</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-for="notification in notifications" :href="notification.link" target="_blank">
          <v-list-tile-action>
            <v-icon>{{ notification.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-html="notification.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-menu>

</template>

<script>
import {version} from "../../package.json";

export default {
  data() {
    return {
      currentVersion: version,
      latestRelease: {},
      latestVersion: undefined,
      notifications: []
    }
  },
  computed: {
    countNotifications() {
      return this.notifications.length
    }
  },
  methods : {
    getLatestRelease() {
      return fetch("https://api.github.com/repos/joni1802/ts3-manager/tags")
        .then(res => res.json())
        .then(data => data[0])
    },
    parseVersionNumber(version) {
      let [_number, major, minor, patches] = version.match(
        /([0-9]+)\.([0-9]+)\.([0-9]+)/
      );

      return parseFloat(`${major}.${minor}${patches}`)
    },
    updateAvailable(currentVersion, latestVersion) {
      return this.parseVersionNumber(currentVersion) < this.parseVersionNumber(latestVersion) ? true : false
    },
    createUpdateNotification(release) {
      this.addNotification({
        link: "https://www.ts3.app/releases",
        title: `TS3-Manager <b>${release.name}</b> Is Out Now`,
        icon: "mdi-update"
      })
    },
    addNotification(data) {
      this.notifications.push(data)
    }
  },
  async created() {
    try {
      this.latestRelease = await this.getLatestRelease()
      this.latestVersion = this.latestRelease.name

      if(this.updateAvailable(this.currentVersion, this.latestVersion)) {
        this.createUpdateNotification(this.latestRelease)
      }
    } catch(err) {
      this.$toast.error(err.message)
    }
  }
}
</script>
