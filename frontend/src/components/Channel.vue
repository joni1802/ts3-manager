<template>
<div>
  <v-menu offset-y max-width="300px">
    <template #activator="{ on }">
      <v-list-item v-if="isSpacer(channel.channel_name)" dense  v-on="on">
        <v-list-item-content>
          <v-list-item-title>
            <spacer :channelName="channel.channel_name"></spacer>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-else dense  v-on="on">
        <v-list-item-avatar>
          <v-icon>chat_bubble</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ channel.channel_name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-list>
      <v-list-item @click="enterChannel">
        <v-list-item-action>
          <v-icon>arrow_forward</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Switch to Channel
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{name: 'channel-edit', params: {cid: channel.cid}, query: {pid: channel.pid}}">
        <v-list-item-action>
          <v-icon>edit</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Edit Channel
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{name: 'permissions-channel', params: {cid: channel.cid}}">
        <v-list-item-action>
          <v-icon>verified_user</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Channel Permissions
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{name: 'channel-add', query: {pid: channel.cid}}">
        <v-list-item-action>
          <v-icon>add</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Create Sub-Channel
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="confirmChannelDeletion(channel)">
        <v-list-item-action>
          <v-icon>delete</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Delete Channel
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
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
        <v-btn text @click="deleteChannel" color="primary">Yes</v-btn>
        <v-btn text @click="deleteChannelDialog = false" color="primary">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>
<script>
// Do not dynamically import this component !!!
// Otherwise it will not be shown !!!
import Spacer from '@/components/Spacer'

export default {
  props: {
    channel: Object,
    queryUser: Object
  },
  components: {
    Spacer
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
        this.$toasted.error(err.message)
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
        this.$toasted.error(err.message)
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
