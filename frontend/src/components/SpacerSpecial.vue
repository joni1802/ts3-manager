<template lang="html">
  <svg v-if="characterBlock" height="10" :style="{ width: '100%', filter }">
    <line
      x1="0"
      y1="5"
      x2="100%"
      y2="5"
      stroke="rgba(0,0,0,0.54)"
      stroke-width="0.1rem"
      :stroke-dasharray="dashArray"
    />
  </svg>
</template>

<script>
export default {
  props: {
    characterBlock: String,
  },
  computed: {
    dashArray() {
      switch (this.characterBlock) {
        case "-..":
          return "5 2 1 2 1 2";
        case "___":
          return "0";
        case "-.-":
          return "5 2 1 2";
        case "...":
          return "1 2";
        case "---":
          return "5 2";
      }
    },
    filter() {
      if (this.$vuetify.theme.dark) {
        return "invert(1)";
      } else {
        return "invert(0)";
      }
    },
  },
};
</script>

<style lang="css" scoped></style>
