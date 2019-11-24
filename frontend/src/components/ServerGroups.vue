<template>
  <group-list :groups="regularServerGroups" @add="addServerGroup" @remove="removeServerGroup" @edit="editServerGroup"></group-list>
</template>

<script>
  import GroupList from '@/components/GroupList'

  export default {
    components: {
      GroupList
    },
    data() {
      return {
        serverGroups: []
      }
    },
    computed: {
      regularServerGroups() {
        return this.serverGroups.filter(group => group.type === 1);
      }
    },
    methods: {
      getServerGroupList() {
        return this.$query('servergrouplist')
      },
      async addServerGroup(name) {
        try {
          await this.$query('servergroupadd', {name: name})

          this.serverGroups = await this.getServerGroupList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      async removeServerGroup(group, force) {
        try {
          await this.$query('servergroupdel', {
            sgid: group.sgid,
            force: +force,
          })

          this.serverGroups = await this.getServerGroupList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      editServerGroup(group) {
        this.$router.push({name: 'servergroup-edit', params: {sgid: group.sgid}})
      }
    },
    async created() {
      try {
        this.serverGroups = await this.getServerGroupList()
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})
      }
    }
  };
</script>
