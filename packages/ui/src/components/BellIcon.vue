<template>
  <v-menu offset-y :close-on-content-click="false">
    <template #activator="{ on }">
      <v-btn icon v-on="on">
        <v-badge color="error" :value="countNotifications">
          <template #badge v-if="countNotifications">
            <span>{{ countNotifications }}</span>
          </template>
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-action>
            <v-switch v-model="showNotifications"></v-switch>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Enable Notifications</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list v-if="showNotifications">
        <v-list-item v-if="!countNotifications">
          <v-list-item-content>
            <v-list-item-title>No Notifications</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="notification in notifications"
          :href="notification.link"
          target="_blank"
          :key="notification.title"
        >
          <v-list-item-action>
            <v-icon>{{ notification.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-html="notification.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
import { version } from "../../../../package.json";

export default {
  data() {
    return {
      URL: {
        ts3Manager: [
          "https://api.github.com/repos/joni1802/ts3-manager/releases",
          "https://www.ts3.app/releases",
        ],
      },
      currentTSMVersion: version,
      latestTSMVersion: undefined,
      latestTSMRelease: {}, // latest TS3 Manager release
      currentTeamSpeakVersion: undefined,
      latestTeamSpeakVersion: undefined,
      notifications: [],
    };
  },
  computed: {
    countNotifications() {
      return this.notifications.length;
    },
    showNotifications: {
      get() {
        return this.$store.state.settings.notifications;
      },
      set(status) {
        this.$store.commit("setNotifications", status);
      },
    },
  },
  methods: {
    getCurrentTeamSpeakVersion() {
      // Command "serverinfo" would not work here, because after login the
      // returned object does not contain the property "virtualserverVersion"
      return this.$TeamSpeak
        .execute("version")
        .then((version) => version[0].version);
    },
    getServerPlatform() {
      return this.$TeamSpeak
        .execute("serverinfo")
        .then(([serverinfo]) => serverinfo.virtualserverPlatform);
    },
    getTeamSpeakVersionsUrl() {
      let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin;
      let url = new URL("/api/teamspeak-versions", base);

      return url.href;
    },
    async getLatestTeamSpeakVersion() {
      let teamSpeakVersionUrl = this.getTeamSpeakVersionsUrl();
      let teamSpeakVersions = await fetch(teamSpeakVersionUrl, {
        credentials: "include",
      }).then((data) => data.json());
      let serverPlatform = await this.getServerPlatform();

      // Use the linux version as a fallback if the platform is not listed in the response
      let platformVersion = teamSpeakVersions[serverPlatform.toLowerCase()]
        ? teamSpeakVersions[serverPlatform.toLowerCase()]
        : teamSpeakVersions["linux"];

      // Return the 64 bit version number by default if it is available for the platform
      return platformVersion["x86_64"]
        ? platformVersion["x86_64"].version
        : platformVersion[Object.keys(platformVersion)[0]].version;
    },
    getLatestTSMRelease() {
      return fetch(this.URL.ts3Manager[0])
        .then((res) => res.json())
        .then((releases) => releases.filter((release) => !release.prerelease))
        .then((releases) => releases[0]);
    },
    // returns -1 if a is older than b
    // returns 1 if a is newer than b
    // returns 0 if both version are equal
    compareVersionNumbers(a, b) {
      // convert "v6.0.0-beta" to "6.0.0"
      const versionRegex = /(\d+\.)*\d+/;

      const versionA = a.match(versionRegex);
      const versionB = b.match(versionRegex);

      const versionAArray =
        versionA && versionA.length ? versionA[0].split(".") : [];
      const versionBArray =
        versionB && versionB.length ? versionB[0].split(".") : [];

      const length = Math.max(versionAArray.length, versionBArray.length);

      for (let i = 0; i < length; i++) {
        const numberA = +versionAArray[i] || 0;
        const numberB = +versionBArray[i] || 0;

        if (numberA !== numberB) {
          return numberA > numberB ? 1 : -1;
        }
      }

      return 0;
    },
    updateAvailable(currentVersion, latestVersion) {
      return this.compareVersionNumbers(currentVersion, latestVersion) === -1
        ? true
        : false;
    },
    createNotification({ link = "", title, icon = "mdi-information" }) {
      this.notifications.push({ link, title, icon });
    },
    async init() {
      try {
        this.latestTSMRelease = await this.getLatestTSMRelease();

        this.latestTSMVersion = this.latestTSMRelease.name;
        this.currentTeamSpeakVersion = await this.getCurrentTeamSpeakVersion();
        this.latestTeamSpeakVersion = await this.getLatestTeamSpeakVersion();

        if (
          this.updateAvailable(this.currentTSMVersion, this.latestTSMVersion)
        ) {
          this.createNotification({
            link: this.URL.ts3Manager[1],
            title: `New TS3-Manager <b>${(() =>
              this.latestTSMRelease.name)()}</b> Is Out Now`,
            icon: "mdi-update",
          });
        }

        if (
          this.updateAvailable(
            this.currentTeamSpeakVersion,
            this.latestTeamSpeakVersion
          )
        ) {
          this.createNotification({
            link: `https://files.teamspeak-services.com/releases/server/${this.latestTeamSpeakVersion}/index.html`,
            title: `New TeamSpeak Server Version <b>${(() =>
              this.latestTeamSpeakVersion)()}</b> Available`,
            icon: "mdi-update",
          });
        }
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  watch: {
    showNotifications: {
      immediate: true,
      handler(enabled) {
        enabled ? this.init() : (this.notifications = []);
      },
    },
  },
};
</script>
