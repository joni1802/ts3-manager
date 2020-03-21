<template>
<v-container>
  <v-layout align-center justify-center fill-height>
    <v-flex xs12 sm8 md6 lg5 xl4>
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-layout justify-space-between wrap>
              <v-flex xs12 md6>
                <v-text-field label="Server" placeholder="IP or Domain" v-model="form.host" :rules="[rules.required]"></v-text-field>
              </v-flex>
              <v-flex xs12 md4>
                <v-text-field label="Port" type="number" v-model="form.queryport" :rules="[rules.required]">
                  <template slot="prepend">
                    <v-tooltip bottom>
                      <template slot="activator">
                        <v-icon>mdi-help-circle-outline</v-icon>
                      </template>
                      <span>Enter the SeverQuery port of your server. The default
                        ones are 10011 or 10022 (encrypted).</span>
                    </v-tooltip>
                  </template>
                </v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-checkbox v-model="form.ssh" label="SSH">
                  <template slot="prepend">
                    <v-tooltip bottom>
                      <template slot="activator">
                        <v-icon>mdi-help-circle-outline</v-icon>
                      </template>
                      <span>If SSH is checked (default), the connection to the
                        ServerQuery is encrypted.</span>
                    </v-tooltip>
                  </template>
                </v-checkbox>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Name" v-model="form.username" :rules="[rules.required]" placeholder="e.g. serveradmin" name="username" browser-autocomplete="username"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Password" type="password" v-model="form.password" :rules="[rules.required]" name="password" browser-autocomplete="current-password"></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" :disabled="!valid" @click="connect" :loading="loading">
            <v-icon>arrow_forward</v-icon>Connect
            <template slot="loader">
              <span>Connecting...</span>
            </template>
          </v-btn>
        </v-card-actions>
        <span :style="{ color: '#BDBDBD', marginLeft: '5px' }">Version {{ appVersion }}</span>
      </v-card>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import {
  version
} from "../../package.json";

export default {
  beforeRouteEnter(to, from, next) {
    next(async vm => {
      if (!vm.$store.state.query.token) return;

      vm.$socket.emit(
        "autofillform",
        vm.$store.state.query.token,
        response => {
          vm.form.host = response.host;
          vm.form.queryport = response.queryport;
          vm.form.ssh = response.protocol === "ssh" ? true : false;
          vm.form.username = response.username;
          vm.form.password = response.password;
        }
      );
    });
  },
  data() {
    return {
      valid: false,
      loading: false,
      rules: {
        required: value => !!value || "Required."
      },
      form: {
        host: "",
        queryport: 10022,
        ssh: true,
        username: "",
        password: ""
      },
      appVersion: version
    };
  },
  computed: {
    preparedForm() {
      return {
        host: this.form.host,
        queryport: this.form.queryport,
        protocol: this.form.ssh ? "ssh" : "raw",
        username: this.form.username,
        password: this.form.password
      };
    }
  },
  methods: {
    connectTeamSpeak(credentials) {
      return this.$TeamSpeak.connect(credentials)
    },
    async connect() {
      this.loading = true

      try {
        let {token} = await this.connectTeamSpeak(this.preparedForm)

        this.$store.commit("saveToken", token)
        this.$store.commit("isConnected", true)

        this.$router.push({name: "servers"})
      } catch(err) {

        this.$toast.error(err.message)
      }

      this.loading = false
    }
  }
};
</script>
