<template>
<v-container>
  <v-layout>
    <v-flex md6 sm8 xs12 offset-md3 offset-sm2>
      <v-card>
        <v-card-title>
          {{ title }}
        </v-card-title>
        <v-card-text>
          <v-text-field label="Name" v-model="channelName" :disabled="$store.state.query.loading"></v-text-field>
          <v-text-field type="password" label="Password" v-model="channelPassword" :disabled="$store.state.query.loading"></v-text-field>
          <v-text-field label="Topic" v-model="channelTopic" :disabled="$store.state.query.loading"></v-text-field>
          <v-textarea label="Description" v-model="channelDescription" :disabled="$store.state.query.loading"></v-textarea>
        </v-card-text>

        <v-expansion-panel class="elevation-0">
          <v-expansion-panel-content>
            <template slot="header">
              <div>
                More Options
              </div>
            </template>
            <v-card>
              <v-card-text>
                <v-layout wrap>
                  <v-flex>
                    <v-radio-group label="Max Users" v-model="channelUnlimitedClients">
                      <v-radio label="Unlimited" :value="1"></v-radio>
                      <v-radio label="Limited" :value="0"></v-radio>
                    </v-radio-group>
                    <v-text-field label="Number Of Clients" v-model="channelMaxClients" :disabled="!!channelUnlimitedClients"></v-text-field>
                  </v-flex>
                  <v-flex>
                    <v-checkbox label="Default Channel" v-model="channelIsDefault" :disabled="!!initChannelData.channel_flag_default"></v-checkbox>
                  </v-flex>
                  <v-flex>
                    <v-checkbox label="Voice Data encrypted" v-model="channelIsUnencrypted"></v-checkbox>
                  </v-flex>
                </v-layout>

              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="okay" :disabled="this.$store.state.query.loading" color="primary">OK</v-btn>
          <v-btn flat @click="$router.go(-1)" color="primary">Cancel</v-btn>
          <v-btn flat @click="apply" :disabled="this.$store.state.query.loading" color="primary" :class="{'d-none': !applyButton}">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  props: {
    title: String,
    applyButton: Boolean,
    channel: Object
  },
  data() {
    return {
      initChannelData: {},
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
    channelUnlimitedClients: {
      get() {
        return this.channel.channel_flag_maxclients_unlimited
      },
      set(limited) {
        this.channel.channel_flag_maxclients_unlimited = +limited
      }
    },
    channelMaxClients: {
      get() {
        return this.channel.channel_maxclients
      },
      set(number) {
        this.channel.channel_maxclients = number
      }
    },
    channelIsUnencrypted: {
      get() {
        return !this.channel.channel_codec_is_unencrypted
      },
      set(encrypted) {
        this.channel.channel_codec_is_unencrypted = +!encrypted
      }
    },
    channelIsDefault: {
      get() {
        return this.channel.channel_flag_default
      },
      set(flag) {
        this.channel.channel_flag_default = +flag
      }
    }
  },
  methods: {
    getChanges() {
      let changes = {}

      for (let prop in this.channel) {
        if (this.channel[prop] !== this.initChannelData[prop]) {
          changes[prop] = this.channel[prop]
        }
      }

      return changes
    },
    okay() {
      this.$emit("okay", this.getChanges())
    },
    apply() {
      this.$emit("apply", this.getChanges())

      let unwatch = this.$watch("channel", channel => {
        this.initChannelData = {...channel}

        unwatch()
      })
    }
  },
  created() {
    let unwatch = this.$watch("channel", channel => {
      if(channel) {
        this.initChannelData = {...this.channel}

        // Need to check for unwatch otherwise it will cause an error
        // See https://vuejs.org/v2/api/#vm-watch
        if(unwatch) unwatch()
      }
    }, {immediate: true})
  }
}
</script>
