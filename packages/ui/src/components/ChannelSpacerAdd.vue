<template lang="html">
  <channel-form
    title="Create Spacer"
    @save="save"
    spacer
    :channel="channel"
  ></channel-form>
</template>

<script>
export default {
  components: {
    ChannelForm: () => import("@/components/ChannelForm"),
  },
  data() {
    return {
      // set channel type to permanent by default
      channel: { channelFlagPermanent: 1 },
    };
  },
  methods: {
    createChannel(props) {
      return this.$TeamSpeak.execute("channelcreate", props);
    },
    async save(channelProps) {
      try {
        await this.createChannel({
          channelFlagPermanent: 1,
          ...channelProps,
        });

        this.$router.go(-1);
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
};
</script>

<style lang="css" scoped></style>
