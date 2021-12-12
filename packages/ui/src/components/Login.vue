<template>
  <v-container>
    <v-layout align-center justify-center fill-height>
      <v-flex xs12 sm8 md6 lg5 xl4>
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <v-form v-model="valid">
              <v-layout justify-space-between wrap>
                <v-flex xs6>
                  <v-text-field
                    label="Server"
                    placeholder="IP or Domain"
                    v-model="form.host"
                    :rules="[rules.required]"
                    :disabled="loading"
                  ></v-text-field>
                </v-flex>
                <v-flex xs2>
                  <v-text-field
                    label="Port"
                    type="number"
                    v-model="form.queryport"
                    :rules="[rules.required]"
                    :disabled="loading"
                  ></v-text-field>
                </v-flex>
                <v-flex xs3>
                  <v-checkbox
                    v-model="form.ssh"
                    label="SSH"
                    :disabled="loading"
                    @click="changePort"
                  >
                    <template #append>
                      <v-tooltip bottom>
                        <template #activator="{ on }">
                          <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                        </template>
                        <span
                          >If SSH is checked (default), the connection to the
                          ServerQuery is encrypted.</span
                        >
                      </v-tooltip>
                    </template>
                  </v-checkbox>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    label="Name"
                    v-model="form.username"
                    :rules="[rules.required]"
                    placeholder="e.g. serveradmin"
                    name="username"
                    autocomplete="username"
                    :disabled="loading"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    label="Password"
                    type="password"
                    v-model="form.password"
                    :rules="[rules.required]"
                    name="password"
                    autocomplete="current-password"
                    :disabled="loading"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-checkbox
                    label="Remember me"
                    v-model="rememberLogin"
                    :disabled="loading"
                  ></v-checkbox>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              :disabled="!valid || loading"
              @click="connect"
              :loading="connecting"
            >
              <v-icon>arrow_forward</v-icon>Connect
              <template #loader>
                <span>Connecting...</span>
              </template>
            </v-btn>
          </v-card-actions>
          <span :style="{ color: '#BDBDBD', marginLeft: '5px' }"
            >Version {{ appVersion }}</span
          >
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { version } from "../../../../package.json";

export default {
  data() {
    return {
      panel: [true],
      valid: false,
      rules: {
        required: (value) => !!value || "Required.",
      },
      form: {
        host: "",
        queryport: 10022,
        ssh: true,
        username: "",
        password: "",
      },
      appVersion: version,
      connecting: false,
    };
  },
  computed: {
    rememberLogin: {
      set(value) {
        this.$store.commit("setRememberLogin", value);
      },
      get() {
        return this.$store.state.settings.rememberLogin;
      },
    },
    redirect() {
      return this.$route.query.redirect;
    },
    token() {
      return this.$store.state.query.token;
    },
    loading() {
      return !!this.$store.state.query.loading;
    },
  },
  methods: {
    connectTeamSpeak(credentials) {
      return this.$TeamSpeak.connect(credentials);
    },
    async connect() {
      this.$store.dispatch("startLoading");

      this.connecting = true;

      try {
        let { token } = await this.connectTeamSpeak({
          host: this.form.host,
          queryport: this.form.queryport,
          protocol: this.form.ssh ? "ssh" : "raw",
          username: this.form.username,
          password: this.form.password,
        });

        this.$store.dispatch("saveToken", token);
        this.$store.commit("isConnected", true);

        if (this.redirect) {
          this.$router.push({ path: this.redirect });
        } else {
          this.$router.push({ name: "servers" });
        }
      } catch (err) {
        this.connecting = false;

        this.$toast.error(err.message);
      }

      this.$store.dispatch("stopLoading");
    },
    decryptToken() {
      return new Promise((resolve, reject) => {
        this.$socket.emit("autofillform", this.token, (response) => {
          if (response.host) {
            resolve(response);
          } else {
            reject(new Error(response));
          }
        });
      });
    },
    autofillForm() {
      return this.decryptToken().then((response) => {
        this.form.host = response.host;
        this.form.queryport = response.queryport;
        this.form.ssh = response.protocol === "ssh" ? true : false;
        this.form.username = response.username;
        this.form.password = response.password;
      });
    },
    changePort() {
      this.form.ssh
        ? (this.form.queryport = 10022)
        : (this.form.queryport = 10011);
    },
  },
  async created() {
    this.$store.dispatch("startLoading");

    try {
      if (this.rememberLogin && this.token) {
        await this.autofillForm();
      }
    } catch (err) {
      this.$store.dispatch("removeToken");

      this.$toast.error(err.message);
    }

    this.$store.dispatch("stopLoading");
  },
  async beforeRouteLeave(from, to, next) {
    try {
      await this.$TeamSpeak.init();
    } catch (err) {
      this.$toast.error(err.message);
    }

    next();
  },
};
</script>

<style>
.v-expansion-panel__header {
  padding: 0 !important;
}
</style>
