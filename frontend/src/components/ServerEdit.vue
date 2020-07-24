<template lang="html">
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title>Manage Virtual Server</v-card-title>
          <v-card-text>
            <v-text-field
              label="Server Name"
              v-model="serverInfo.virtualserver_name"
              :disabled="$store.state.query.loading"
            ></v-text-field>
            <v-text-field
              label="Password"
              v-model="serverInfo.virtualserver_password"
              :disabled="$store.state.query.loading"
              type="password"
            ></v-text-field>
            <v-layout justify-space-between>
              <v-flex xs5>
                <v-text-field
                  label="Maximum Clients"
                  v-model="serverInfo.virtualserver_maxclients"
                  :disabled="$store.state.query.loading"
                  type="number"
                ></v-text-field>
              </v-flex>
              <v-flex xs5>
                <v-text-field
                  label="Reserved Slots"
                  v-model="serverInfo.virtualserver_reserved_slots"
                  :disabled="$store.state.query.loading"
                  type="number"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-textarea
              label="Welcome Message"
              v-model="serverInfo.virtualserver_welcomemessage"
              :disabled="$store.state.query.loading"
            ></v-textarea>
            <v-expansion-panel class="elevation-0">
              <v-expansion-panel-content>
                <template slot="header">
                  <div>Host</div>
                </template>
                <v-card color="grey lighten-5">
                  <v-card-title>Host Message</v-card-title>
                  <v-card-text>
                    <v-text-field
                      label="Message"
                      v-model="serverInfo.virtualserver_hostmessage"
                      :disabled="$store.state.query.loading"
                    ></v-text-field>
                    <v-select
                      label="Message Mode"
                      v-model="serverInfo.virtualserver_hostmessage_mode"
                      :items="messageModes"
                    ></v-select>
                  </v-card-text>
                </v-card>
                <v-card color="grey lighten-5" class="mt-2">
                  <v-card-title>Host Banner</v-card-title>
                  <v-card-text>
                    <v-text-field
                      label="Banner Gfx URL"
                      v-model="serverInfo.virtualserver_hostbanner_gfx_url"
                      :disabled="$store.state.query.loading"
                    ></v-text-field>
                    <v-text-field
                      label="URL"
                      v-model="serverInfo.virtualserver_hostbanner_url"
                      :disabled="$store.state.query.loading"
                    ></v-text-field>
                    <v-layout justify-space-between>
                      <v-flex xs4>
                        <v-text-field
                          label="Gfx Interval"
                          v-model="serverInfo.virtualserver_hostbanner_gfx_interval"
                          type="number"
                          :disabled="$store.state.query.loading"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6>
                        <v-select
                          label="Resize"
                          :items="bannerModes"
                          v-model="serverInfo.virtualserver_hostbanner_mode"
                        ></v-select>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
                <v-card color="grey lighten-5" class="my-2">
                  <v-card-title>Host Button</v-card-title>
                  <v-card-text>
                    <v-text-field
                      label="Tooltip"
                      v-model="serverInfo.virtualserver_hostbutton_tooltip"
                      :disabled="$store.state.query.loading"
                    ></v-text-field>
                    <v-text-field
                      label="URL"
                      v-model="serverInfo.virtualserver_hostbutton_url"
                      :disabled="$store.state.query.loading"
                    ></v-text-field>
                    <v-text-field
                      label="Icon URL"
                      v-model="serverInfo.virtualserver_hostbutton_gfx_url"
                      :disabled="$store.state.query.loading"
                    ></v-text-field>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
              <v-expansion-panel-content>
                <template slot="header">
                  <div></div>
                </template>

              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat :disabled="this.$store.state.query.loading" color="primary">OK</v-btn>
            <v-btn flat @click="$router.go(-1)" color="primary">Cancel</v-btn>
            <v-btn flat :disabled="this.$store.state.query.loading" color="primary">Apply</v-btn>
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
      serverInfo: {},
      serverInfoCopy: {},
      messageModes: [
        {text: "No message", value: 0},
        {text: "Show message in log", value: 1},
        {text: "Show modal message", value: 2},
        {text: "Modal message and exit", value: 3},
      ],
      bannerModes: [
        {text: "Do not adjust", value: 0},
        {text: "Adjust but ignore aspect ratio", value: 1},
        {text: "Adjust and keep aspect ratio", value: 2}
      ]
    }
  },
  methods: {
    getServerInfo() {
      return this.$TeamSpeak.execute("serverinfo").then(arr => arr[0])
    }
  },
  async created() {
    try {
      this.serverInfo = await this.getServerInfo()
      this.serverInfoCopy = {...this.serverInfo}

      console.log('message mode', this.serverInfoCopy.virtualserver_hostmessage_mode);
    } catch(err) {
      this.$toast.error(err.message)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
