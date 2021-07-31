<template lang="html">
  <v-btn color="primary" @click="refreshList">
    <v-icon>mdi-refresh</v-icon>
    Refresh
  </v-btn>
</template>

<script>
export default {
  props: {
    /**
     * Currently open folders
     * @type {Array.<TreeItem>}
     */
    openFolders: Array,
  },
  methods: {
    refreshList() {
      this.$emit("refresh", this.openFolders);
    },
  },
};
</script>

<style lang="css" scoped></style>
