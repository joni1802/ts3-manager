<template>
<v-container>
  <v-layout>
    <v-flex xs12>
      <permission-table :grantedPermissions="permissions" type="Channel Permissions" :editableContent="['permvalue']" @save="savePermission" @remove="removePermission" @loaded="init">
        <template slot="selectMenu">
          <v-flex sm3 xs12>
            <v-autocomplete :items="channelSelection" v-model="selectedChannel" @change="changeChannel" label="Channel" :disabled="$store.state.query.loading"></v-autocomplete>
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
      channels: [],
      channelId: this.$route.params.cid,
    }
  },
  computed: {
    channelSelection() {
      return this.channels.map(channel => {
        return {
          text: channel.channel_name,
          value: channel.cid
        }
      })
    },
    selectedChannel: {
      get() {
        let channel = this.channels.find(channel => channel.cid == this.channelId)

        return channel && channel.cid
      },
      set() {
        //
      }
    }
  },
  methods: {
    getChannelPermissions() {
      return this.$TeamSpeak.execute('channelpermlist', {
        cid: this.channelId
      })
    },
    getChannelList() {
      return this.$TeamSpeak.execute('channellist')
    },
    async savePermission(permissionValues) {
      let {
        permid,
        permvalue
      } = permissionValues

      try {
        await this.$TeamSpeak.execute('channeladdperm', {
          cid: this.channelId,
          permid: permid,
          permvalue: permvalue
        })
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }

      try {
        this.permissions = await this.getChannelPermissions()
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }
    },
    async removePermission(permissionValues) {
      let {
        permid
      } = permissionValues

      try {
        await this.$TeamSpeak.execute('channeldelperm', {
          cid: this.channelId,
          permid: permid
        })
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }

      try {
        this.permissions = await this.getChannelPermissions()
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }
    },
    changeChannel(cid) {
      this.$router.push({
        name: 'permissions-channel',
        params: {
          cid: cid
        }
      })
    },
    async init() {
      try {
        this.channels = await this.getChannelList()

        if (!this.channelId) {
          this.$router.replace({
            name: 'permissions-channel',
            params: {
              cid: this.channels[0].cid
            }
          })
        }

        this.permissions = await this.getChannelPermissions()
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }
    }
  },
  async beforeRouteUpdate(to, from, next) {
    this.channelId = to.params.cid
    this.permissions = await this.getChannelPermissions()

    next()
  },
}
</script>
