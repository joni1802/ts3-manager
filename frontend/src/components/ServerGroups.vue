<template>
  <group-list
    :groups="regularServerGroups"
    @add="addServerGroup"
    @remove="removeServerGroup"
    @edit="editServerGroup"
  ></group-list>
</template>

<script>
export default {
  components: {
    GroupList: () => import("@/components/GroupList"),
  },
  data() {
    return {
      serverGroups: [],
    };
  },
  computed: {
    regularServerGroups() {
      return this.serverGroups.filter((group) => group.type === 1);
    },
  },
  methods: {
    getServerGroupList() {
      return this.$TeamSpeak.execute("servergrouplist").then((list) => {
        return list;
      });
    },
    async addServerGroup(name) {
      try {
        await this.$TeamSpeak.execute("servergroupadd", { name: name });

        this.serverGroups = await this.getServerGroupList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async removeServerGroup(group, force) {
      try {
        await this.$TeamSpeak.execute("servergroupdel", {
          sgid: group.sgid,
          force: +force,
        });

        this.serverGroups = await this.getServerGroupList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    editServerGroup(group) {
      this.$router.push({
        name: "servergroup-edit",
        params: { sgid: group.sgid },
      });
    },
  },
  async created() {
    try {
      this.serverGroups = await this.getServerGroupList();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
};
</script>
