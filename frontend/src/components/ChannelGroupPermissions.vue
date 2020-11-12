<template>
<v-container>
  <v-layout>
    <v-flex xs12>
      <permission-table :grantedPermissions="permissions" type="Channel Groups" :editableContent="['permvalue']" @save="savePermission" @remove="removePermission" @loaded="init">
        <template #selectMenu>
          <v-flex sm3 xs12>
            <v-autocomplete :items="channelGroupSelection" v-model="selectedChannelGroup" @change="changeChannelGroup" label="Channel Group" :disabled="$store.state.query.loading"></v-autocomplete>
          </v-flex xs12>
        </template>
      </permission-table>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  components: {
    PermissionTable: () => import('@/components/PermissionTable')
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
        return {
          text: group.name,
          value: group.cgid
        }
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
      return this.$TeamSpeak.execute('channelgrouppermlist', {
        cgid: this.channelGroupId
      })
    },
    getChannelGroupList() {
      return this.$TeamSpeak.execute('channelgrouplist')
    },
    async savePermission(permission) {
      let {
        permid,
        permvalue
      } = permission

      try {
        await this.$TeamSpeak.execute('channelgroupaddperm', {
          cgid: this.channelGroupId,
          permid: permid,
          permvalue: permvalue
        })
      } catch (err) {
        this.$toasted.error(err.message)
      }

      try {
        this.permissions = await this.getChannelGroupPermList()
      } catch (err) {
        this.$toasted.error(err.message)
      }
    },
    async removePermission(permission) {
      let {
        permid
      } = permission

      try {
        await this.$TeamSpeak.execute('channelgroupdelperm', {
          cgid: this.channelGroupId,
          permid: permid,
        })
      } catch (err) {
        this.$toasted.error(err.message)
      }

      try {
        this.permissions = await this.getChannelGroupPermList()
      } catch (err) {
        this.$toasted.error(err.message)
      }
    },
    changeChannelGroup(cgid) {
      this.$router.push({
        name: 'permissions-channelgroup',
        params: {
          cgid: cgid
        }
      })
    },
    async init() {
      try {
        this.channelGroups = await this.getChannelGroupList()

        if (!this.channelGroupId) {
          this.$router.replace({
            name: 'permissions-channelgroup',
            params: {
              cgid: this.normalChannelGroups[0].cgid
            }
          })
        }

        this.permissions = await this.getChannelGroupPermList()
      } catch (err) {
        this.$toasted.error(err.message)
      }
    }
  },
  async beforeRouteUpdate(to, from, next) {
    try {
      this.channelGroupId = to.params.cgid
      this.permissions = await this.getChannelGroupPermList()
    } catch(err) {
      this.$toasted.error(err.message)
    }

    next()
  },
}
</script>
