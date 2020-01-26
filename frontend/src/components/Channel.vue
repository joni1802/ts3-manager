<template>
<div>
  <v-menu offset-x style="width: 100%">
    <template slot="activator">
      <spacer v-if="isSpacer(channel.channel_name)" :channelName="channel.channel_name"></spacer>
      <v-btn flat v-else>
        <v-icon>chat_bubble</v-icon>
        {{ channel.channel_name }}
      </v-btn>
    </template>
    <v-list>
      <v-list-tile @click="enterChannel">
        <v-list-tile-action>
          <v-icon>arrow_forward</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            Switch to Channel
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile :to="{name: 'channel-edit', params: {cid: channel.cid}}">
        <v-list-tile-action>
          <v-icon>edit</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            Edit Channel
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile :to="{name: 'permissions-channel', params: {cid: channel.cid}}">
        <v-list-tile-action>
          <v-icon>verified_user</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            Channel Permissions
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile @click="confirmChannelDeletion(channel)">
        <v-list-tile-action>
          <v-icon>delete</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            Delete Channel
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-menu>

  <v-dialog v-model="deleteChannelDialog" max-width="500px">
    <v-card>
      <v-card-title>Delete Channel</v-card-title>
      <v-card-text>
        Do you really want to delete that channel?
        <v-checkbox v-model="forceDeletion" label="Delete even if there are clients in the channel"></v-checkbox>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click="deleteChannel" color="primary">Yes</v-btn>
        <v-btn flat @click="deleteChannelDialog = false" color="primary">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>
<script>
export default {
  props: {
    channel: Object,
    queryUser: Object
  },
  components: {
    Spacer: () => import('@/components/Spacer')
  },
  data() {
    return {
      spacer: /\[(.*)(spacer)(.*)\](.*)/i,
      deleteChannelDialog: false,
      selectedChannel: {},
      forceDeletion: false,
    }
  },
  methods: {
    isSpacer(channelName) {
      return this.spacer.test(channelName)
    },
    confirmChannelDeletion(channel) {
      this.selectedChannel = {
        ...channel
      }

      this.deleteChannelDialog = true
    },
    async deleteChannel() {
      let {
        cid
      } = this.selectedChannel
      let force = +this.forceDeletion

      try {
        await this.$TeamSpeak.execute('channeldelete', {
          cid: cid,
          force: force
        })
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }

      this.deleteChannelDialog = false
    },
    moveClient() {
      return this.$TeamSpeak.execute('clientmove', {
        clid: this.queryUser.client_id,
        cid: this.channel.cid
      })
    },
    async enterChannel() {
      try {
        await this.moveClient()
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>

<style scoped>
* {
  text-transform: none !important;
}
</style>
