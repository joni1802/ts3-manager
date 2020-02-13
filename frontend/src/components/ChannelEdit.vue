<template>
<v-container>
  <v-layout>
    <v-flex md6 sm8 xs12 offset-md3 offset-sm2>
      <v-card>
        <v-card-title>
          Channel Edit
        </v-card-title>
        <v-card-text>
          <v-text-field label="Name" v-model="channelName" :disabled="$store.state.query.loading"></v-text-field>
          <v-text-field type="password" label="Password" v-model="channelPassword" :disabled="$store.state.query.loading"></v-text-field>
          <v-text-field label="Topic" v-model="channelTopic" :disabled="$store.state.query.loading"></v-text-field>
          <v-textarea label="Description" v-model="channelDescription" :disabled="$store.state.query.loading"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="save" :disabled="this.$store.state.query.loading" color="primary">OK</v-btn>
          <v-btn flat @click="$router.go(-1)" color="primary">Cancel</v-btn>
          <v-btn flat @click="save" :disabled="this.$store.state.query.loading" color="primary">Apply</v-btn>
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
      channelCopy: {}
    }
  },
  computed: {
    channelName: {
      get() {
        return this.channel.channel_name
      },
      set(name) {
        this.channel.channel_name = name
      }
    },
    channelPassword: {
      get() {
        return this.channel.channel_password
      },
      set(password) {
        this.channel.channel_password = password
      }
    },
    channelTopic: {
      get() {
        return this.channel.channel_topic
      },
      set(topic) {
        this.channel.channel_topic = topic
      }
    },
    channelDescription: {
      get() {
        return this.channel.channel_description
      },
      set(description) {
        this.channel.channel_description = description
      }
    },
  },
  methods: {
    getChanges() {
      let changes = {}

      for (let prop in this.channel) {
        if (this.channel[prop] !== this.channelCopy[prop]) {
          changes[prop] = this.channel[prop]
        }
      }

      return changes
    },
    getChannelInfo() {
      return this.$TeamSpeak.execute('channelinfo', {
        cid: this.channelId
      }).then(channelinfo => channelinfo[0])
    },
    async save(e) {
      try {
        let channelProps = {}
        let changes = this.getChanges()

        if (Object.keys(changes).length) {
          channelProps = {
            cid: this.channelId,
            ...changes
          }

          await this.$TeamSpeak.execute('channeledit', channelProps)
        }
      } catch (err) {
        this.$toast.error(err.message)
      }

      switch (e.target.textContent) {
        case 'OK':
          this.$router.go(-1)
          break;
        case 'Apply':
          this.init()
      }
    },
    async init() {
      try {
        this.channel = await this.getChannelInfo()

        this.channelCopy = {
          ...this.channel
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  },
  async created() {
    this.init()
  },
}
</script>
