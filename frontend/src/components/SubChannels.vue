<template>
  <ul>
    <li v-for="channel in subchannels" :key="channel.cid">
      <channel :channel="channel" :clients="clients"></channel>
    </li>
  </ul>
</template>
<script>
  export default {
    props: {
      subchannels: Array,
      clients: Array
    },
    components: {
      Channel: () => import('@/components/Channel.vue')
    }
  }
</script>

<style scoped>
  ul {
    list-style: none;
  }

  li {
    padding: 0.25rem;
  }
</style>
