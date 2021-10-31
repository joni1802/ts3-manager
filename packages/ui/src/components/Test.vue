<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <h1>Parent</h1>
        <!-- <v-btn @click="test">Test</v-btn> -->
        <v-btn @click="logout">Logout</v-btn>
        <v-btn @click="login">Login</v-btn>
        <v-btn @click="whoAmI">Who Am I</v-btn>
      </v-col>
    </v-row>
    <router-view v-if="loaded"></router-view>
  </v-container>
</template>

<script>
function sleep(milli) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milli);
  });
}

export default {
  data() {
    return {
      loaded: false,
    };
  },
  methods: {
    getClientList() {
      return this.$TeamSpeak.execute("clientlist");
    },
    getClientDbList() {
      return this.$TeamSpeak.execute("clientdblist");
    },

    async logout() {
      try {
        // await this.$TeamSpeak.execute("logout");

        await this.$TeamSpeak.execute("use", { sid: 0 });

        this.$store.dispatch("saveServerId", 0);
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async login() {
      try {
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async whoAmI() {
      try {
        let res = await this.$TeamSpeak.execute("whoami");

        console.log(res);
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  async created() {},
};
</script>
