<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <permission-table :grantedPermissions="permissions" type="Channel Groups" :editableContent="['permvalue']" @save="savePermission" @remove="removePermission" @loaded="init">
          <template slot="selectMenu">
            <v-flex sm3 xs12>
              <v-autocomplete :items="channelGroupSelection" v-model="selectedChannelGroup" @change="changeChannelGroup" label="Channel Group"></v-autocomplete>
            </v-flex xs12>
          </template>
        </permission-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import PermissionTable from '@/components/PermissionTable'

  export default {
    components: {
      PermissionTable
    },
    data() {
      return {
        permissions: [],
        channelGroups: [],
        channelGroupId: this.$route.params.cgid,
      }
    },
    computed: {
      normalChannelGroups() {
        return this.channelGroups.filter(group => group.type === 1)
      },
      channelGroupSelection() {
        return this.normalChannelGroups.map(group => {
          return {text: group.name, value: group.cgid}
        })
      },
      selectedChannelGroup: {
        get() {
          let channelGroup = this.channelGroups.find(group => group.cgid == this.channelGroupId)

          return channelGroup && channelGroup.cgid
        },
        set() {
          // Empty
        }
      }
    },
    methods: {
      getChannelGroupPermList() {
        return this.$query('channelgrouppermlist', {cgid: this.channelGroupId})
      },
      getChannelGroupList() {
        return this.$query('channelgrouplist')
      },
      async savePermission(permission) {
        let {permid, permvalue} = permission

        try {
          await this.$query('channelgroupaddperm', {
            cgid: this.channelGroupId,
            permid: permid,
            permvalue: permvalue
          })
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        try {
          this.permissions = await this.getChannelGroupPermList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      async removePermission(permission) {
        let {permid} = permission

        try {
          await this.$query('channelgroupdelperm', {
            cgid: this.channelGroupId,
            permid: permid,
          })
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        try {
          this.permissions = await this.getChannelGroupPermList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      },
      changeChannelGroup(cgid) {
        this.$router.push({name: 'permissions-channelgroup', params: {cgid: cgid}})
      },
      async init() {
        try {
          this.channelGroups = await this.getChannelGroupList()
          this.permissions = await this.getChannelGroupPermList()
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      }
    },
    async beforeRouteUpdate(to, from, next) {
      this.channelGroupId = to.params.cgid
      this.permissions = await this.getChannelGroupPermList()

      next()
    },
  }
</script>
