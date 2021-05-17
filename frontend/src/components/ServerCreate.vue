<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title> Create Server </v-card-title>
          <v-card-text>
            <v-form v-model="valid">
              <v-layout justify-space-between wrap>
                <v-flex xs12>
                  <v-text-field
                    v-model="serverName"
                    label="Name"
                    :disabled="$store.state.query.loading"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    v-model="serverPort"
                    label="Port"
                    type="number"
                    :disabled="$store.state.query.loading"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    v-model="maxClients"
                    label="Max. Clients"
                    type="number"
                    :disabled="$store.state.query.loading"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <token-display v-model="token"></token-display>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="createServer" :disabled="!valid" color="primary"
              >Create</v-btn
            >
            <v-btn text @click="$router.go(-1)" color="primary">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  components: {
    TokenDisplay: () => import("@/components/TokenDisplay"),
  },
  data() {
    return {
      valid: false,
      servers: [],
      serverName: "",
      serverPort: undefined,
      maxClients: 32,
      rules: {
        required: (value) => !!value || "Required.",
      },
      token: "",
    };
  },
  methods: {
    getServerList() {
      return this.$TeamSpeak.execute("serverlist");
    },
    getAvailablePort() {
      return (
        Math.max(...this.servers.map((server) => server.virtualserver_port)) + 1
      );
    },
    async createServer() {
      try {
        let [response] = await this.$TeamSpeak.execute("servercreate", {
          virtualserver_name: this.serverName,
          virtualserver_port: this.serverPort,
          virtualserver_maxclients: this.maxClients,
        });

        this.token = response.token;

        this.$toast.success("Server successfully created");

        await this.$TeamSpeak.selectServer(response.sid);
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  async created() {
    try {
      this.servers = await this.getServerList();
      this.serverPort = this.getAvailablePort();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
};
</script>
