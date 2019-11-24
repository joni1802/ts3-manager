<template>
  <div>
    <v-menu offset-x :full-width="isSpacer()">
      <template slot="activator">
        <spacer v-if="isSpacer()" :channelName="channel.channel_name"></spacer>
        <div v-else>
          <v-icon>chat_bubble</v-icon>
          <span>{{ channel.channel_name }}</span>
        </div>
      </template>
      <v-list>
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

    <channel-clients v-if="channel.total_clients !== '0'" :channel="channel" :clients="clients"></channel-clients>

    <sub-channels v-if="channel.subchannels" :subchannels="channel.subchannels" :clients="clients"></sub-channels>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        deleteChannelDialog: false,
        selectedChannel: {},
        forceDeletion: false,
      }
    },
    props: {
      channel: Object,
      clients: Array
    },
    methods: {
      confirmChannelDeletion(channel) {
        this.selectedChannel = {...channel}

        this.deleteChannelDialog = true
      },
      async deleteChannel() {
        let {cid} = this.selectedChannel
        let force = + this.forceDeletion

        try {
          await this.$query('channeldelete', {
            cid: cid,
            force: force
          })
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }

        this.deleteChannelDialog = false

        this.updateView()
      },
      isSpacer() {
        let spacer = /\[.*spacer.*\]/i

        if(this.channel.pid === 0 && spacer.test(this.channel.channel_name)) return true

        return false
      },
      updateView() {
        this.$eventBus.$emit('update')
      }
    },
    components: {
      SubChannels: () => import('@/components/SubChannels.vue'),
      Spacer: () => import('@/components/Spacer'),
      ChannelClients: () => import('@/components/ChannelClients')
    },
  }
</script>

<style scoped>
  ul {
    list-style: none;
  }

  li {
    padding: 0.25rem;
  }

  span{
    padding: 0.4rem 0.5rem;
  }

  span:hover {
    background: #bdc3c7;
    border-radius: 0.5rem;
  }
</style>
