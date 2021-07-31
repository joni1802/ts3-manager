<template>
  <group-list
    :groups="channelGroups"
    @add="addChannelGroup"
    @remove="removeChannelGroup"
    @edit="editChannelGroup"
    @copy="copyChannelGroup"
  ></group-list>
</template>

<script>
export default {
  components: {
    GroupList: () => import("@/components/GroupList"),
  },
  data() {
    return {
      channelGroups: [],
    };
  },
  methods: {
    getChannelGroupList() {
      return this.$TeamSpeak.execute("channelgrouplist");
    },
    async addChannelGroup(name, type) {
      try {
        await this.$TeamSpeak.execute("channelgroupadd", { name, type });
      } catch (err) {
        this.$toast.error(err.message);
      }

      try {
        this.channelGroups = await this.getChannelGroupList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async removeChannelGroup(group, force) {
      try {
        await this.$TeamSpeak.execute("channelgroupdel", {
          cgid: group.cgid,
          force: +force, // unary operator converts true => 1 and false => 0
        });
      } catch (err) {
        this.$toast.error(err.message);
      }

      try {
        this.channelGroups = await this.getChannelGroupList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    editChannelGroup(group) {
      this.$router.push({
        name: "channelgroup-edit",
        params: { cgid: group.cgid },
      });
    },
    async copyChannelGroup(
      sourceGroup,
      targetGroup,
      targetGroupName,
      overwriteGroup,
      groupType
    ) {
      try {
        await this.$TeamSpeak.execute("channelgroupcopy", {
          scgid: sourceGroup.cgid,
          tcgid: overwriteGroup ? targetGroup.cgid : 0,
          // Even though the parameter "name" is ignored, when a target group is selected, it needs a value.
          // Otherwise the ServerQuery will throw an error.
          name: targetGroupName,
          type: groupType,
        });
      } catch (err) {
        this.$toast.error(err.message);
      }

      try {
        this.channelGroups = await this.getChannelGroupList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  async created() {
    try {
      this.channelGroups = await this.getChannelGroupList();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
};
</script>
