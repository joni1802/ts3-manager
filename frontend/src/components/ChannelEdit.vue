<template>
  <v-container>
    <v-layout>
      <v-flex md6 sm8 xs12 offset-md3 offset-sm2>
        <v-card>
          <v-card-title>
            Channel Edit
          </v-card-title>
          <v-card-text>
            <v-text-field label="Name" v-model="editedChannel.channel_name"></v-text-field>
            <v-text-field type="password" label="Password" v-model="editedChannel.channel_password"></v-text-field>
            <v-text-field label="Topic" v-model="editedChannel.channel_topic"></v-text-field>
            <v-textarea label="Description" v-model="editedChannel.channel_description"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="$router.go(-1)" color="primary"><v-icon>arrow_back</v-icon>Back</v-btn>
            <v-btn flat @click="save" :disabled="disabled" color="primary">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    data() {
      return {
        channelId: this.$route.params.cid,
        channel: {},
        editedChannel: {},
        loading: true,
        disabled: true,
      }
    },
    methods: {
      getChannelInfo() {
        return this.$query('channelinfo', {cid: this.channelId}).then(channelinfo => channelinfo[0])
      },
      detectedChanges() {
        let changes = {}

        for(let prop in this.channel) {
          if(this.channel[prop] != this.editedChannel[prop]) {
            changes[prop] = this.editedChannel[prop]
          }
        }

        return changes
      },
      async save() {
        let params = {...this.detectedChanges(), cid: this.channelId}

        try {
          await this.$query('channeledit', params)

          this.$toast.success('Channel updated', {icon: 'done'})
        } catch(err) {
          this.$toast.error(err.message, {icon: 'error'})
        }
      }
    },
    async created() {
      try {
        this.channel = await this.getChannelInfo()

        this.editedChannel = {...this.channel}
      } catch(err) {
        this.$toast.error(err.message, {icon: 'error'})
      }
    },
    watch: {
      editedChannel: {
        handler() {
          // If something was changed
          if(Object.keys(this.detectedChanges()).length !== 0) {
            this.disabled = false // enable the save button
          } else {
            this.disabled = true // disable the change button
          }
        },
        deep: true // needs to be called for nested Objects
      }
    }
  }
</script>
