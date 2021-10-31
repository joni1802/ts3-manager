<template>
  <v-row justify="center">
    <v-col cols="12">
      <h1>Child</h1>
    </v-col>
  </v-row>
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
    return {};
  },
  methods: {
    getClientList() {
      return this.$TeamSpeak.execute("clientlist");
    },
    getClientDbList() {
      return this.$TeamSpeak.execute("clientdblist");
    },
  },
  async created() {
    try {
      await this.getClientList();
      console.log("Child: Clientlist loaded");
      await this.getClientDbList();
      console.log("Child: Clientdblist loaded");
    } catch (err) {
      console.log(err);
    }
  },
};
</script>
