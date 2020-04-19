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
        <v-list-tile>
          <v-list-tile-action>
            <v-switch v-model="showNotifications"></v-switch>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Enable Notifications</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list v-if="showNotifications">
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
      currentTSMVersion: version,
      latestTSMVersion: undefined,
      latestTSMRelease: {}, // latest TS3 Manager release
      currentTeamSpeakVersion: undefined,
      latestTeamSpeakVersion: undefined,
      notifications: []
    }
  },
  computed: {
    countNotifications() {
      return this.notifications.length
    },
    showNotifications: {
      get() {
        return this.$store.state.settings.notifications
      },
      set(status) {
        this.$store.commit("setNotifications", status)
      }
    }
  },
  methods : {
    getCurrentTeamSpeakVersion() {
      return this.$TeamSpeak.execute("version")
        .then(version => version[0].version)
    },
    getTeamSpeakVersions() {
      return fetch("http://files.teamspeak-services.com/releases/server/")
        .then(res => res.text())
        .then(text => {
          let parser = new DOMParser()
          let html = parser.parseFromString(text, "text/html")
          let links = html.querySelectorAll("a")

          return [...links].map(link => link.text).filter(version => this.parseVersionNumber(version))
        })
    },
    getLatestTeamSpeakVersion() {
      return this.getTeamSpeakVersions()
        .then(versions => {
          let parsedVersions = versions.map(version => this.parseVersionNumber(version))
          let newestParsedVersion = Math.max(...parsedVersions)

          return versions.find(version => this.parseVersionNumber(version) === newestParsedVersion)
        })
    },
    getLatestTSMRelease() {
      return fetch("https://api.github.com/repos/joni1802/ts3-manager/tags")
        .then(res => res.json())
        .then(data => data[0])
    },
    parseVersionNumber(version) {
      let extractedVersion = version.match(
        /([0-9]+)\.([0-9]+)\.([0-9]+)/
      );

      if(extractedVersion) {
        let [_number, major, minor, patches] = extractedVersion

        return parseFloat(`${major}${minor}.${patches}`)
      }
    },
    updateAvailable(currentVersion, latestVersion) {
      return this.parseVersionNumber(currentVersion) < this.parseVersionNumber(latestVersion) ? true : false
    },
    createNotification({link = "", title, icon = "mdi-information"}) {
      this.notifications.push({link, title, icon})
    },
    async init() {
      try {
        this.latestTSMRelease = await this.getLatestTSMRelease()
        this.latestTSMVersion = this.latestTSMRelease.name
        this.currentTeamSpeakVersion = await this.getCurrentTeamSpeakVersion()
        this.latestTeamSpeakVersion = await this.getLatestTeamSpeakVersion()

        if(this.updateAvailable(this.currentTSMVersion, this.latestTSMVersion)) {
          this.createNotification({
            link: "https://www.ts3.app/releases",
            title: `New TS3-Manager <b>${(() => this.latestTSMRelease.name)()}</b> Is Out Now`,
            icon: "mdi-update"
          })
        }

        if(this.updateAvailable(this.currentTeamSpeakVersion, this.latestTeamSpeakVersion)) {
          this.createNotification({
            link: `http://files.teamspeak-services.com/releases/server/${(() => this.latestTeamSpeakVersion)()}`,
            title: `New TeamSpeak Server Version <b>${(() => this.latestTeamSpeakVersion)()}</b> Available`,
            icon: "mdi-update"
          })
        }
      } catch(err) {
        this.$toast.error(err.message)
      }
    }
  },
  watch: {
    showNotifications: {
      immediate: true,
      handler(enabled) {
        enabled ? this.init() : this.notifications = []
      }
    }
  }
}
</script>
