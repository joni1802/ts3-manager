<template lang="html">
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title>Manage Virtual Server</v-card-title>
          <v-card-text>
            <v-text-field
              label="Server Name"
              v-model="serverInfo.virtualserverName"
              :disabled="$store.state.query.loading"
            ></v-text-field>
            <v-text-field
              label="Password"
              v-model="serverInfo.virtualserverPassword"
              :disabled="$store.state.query.loading"
              type="password"
            ></v-text-field>
            <v-layout justify-space-between>
              <v-flex xs5>
                <v-text-field
                  label="Maximum Clients"
                  v-model="serverInfo.virtualserverMaxclients"
                  :disabled="$store.state.query.loading"
                  type="number"
                ></v-text-field>
              </v-flex>
              <v-flex xs5>
                <v-text-field
                  label="Reserved Slots"
                  v-model="serverInfo.virtualserverReservedSlots"
                  :disabled="$store.state.query.loading"
                  type="number"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-textarea
              label="Welcome Message"
              v-model="serverInfo.virtualserverWelcomemessage"
              :disabled="$store.state.query.loading"
            ></v-textarea>

            <v-expansion-panels accordion flat>
              <v-expansion-panel>
                <v-expansion-panel-header> Host </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card outlined>
                    <v-card-subtitle>Host Message</v-card-subtitle>
                    <v-card-text>
                      <v-text-field
                        label="Message"
                        v-model="serverInfo.virtualserverHostmessage"
                        :disabled="$store.state.query.loading"
                      ></v-text-field>
                      <v-select
                        label="Message Mode"
                        v-model="serverInfo.virtualserverHostmessageMode"
                        :items="messageModes"
                      ></v-select>
                    </v-card-text>
                  </v-card>
                  <v-card class="mt-2" outlined>
                    <v-card-subtitle>Host Banner</v-card-subtitle>
                    <v-card-text>
                      <v-text-field
                        label="Banner Gfx URL"
                        v-model="serverInfo.virtualserverHostbannerGfxUrl"
                        :disabled="$store.state.query.loading"
                      ></v-text-field>
                      <v-text-field
                        label="URL"
                        v-model="serverInfo.virtualserverHostbannerUrl"
                        :disabled="$store.state.query.loading"
                      ></v-text-field>
                      <v-layout justify-space-between>
                        <v-flex xs4>
                          <v-text-field
                            label="Gfx Interval"
                            v-model="
                              serverInfo.virtualserverHostbannerGfxInterval
                            "
                            type="number"
                            :disabled="$store.state.query.loading"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs6>
                          <v-select
                            label="Resize"
                            :items="bannerModes"
                            v-model="serverInfo.virtualserverHostbannerMode"
                          ></v-select>
                        </v-flex>
                      </v-layout>
                    </v-card-text>
                  </v-card>
                  <v-card class="my-2" outlined>
                    <v-card-subtitle>Host Button</v-card-subtitle>
                    <v-card-text>
                      <v-text-field
                        label="Tooltip"
                        v-model="serverInfo.virtualserverHostbuttonTooltip"
                        :disabled="$store.state.query.loading"
                      ></v-text-field>
                      <v-text-field
                        label="URL"
                        v-model="serverInfo.virtualserverHostbuttonUrl"
                        :disabled="$store.state.query.loading"
                      ></v-text-field>
                      <v-text-field
                        label="Icon URL"
                        v-model="serverInfo.virtualserverHostbuttonGfxUrl"
                        :disabled="$store.state.query.loading"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header> Transfers </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card outlined>
                    <v-card-subtitle>Upload</v-card-subtitle>
                    <v-card-text>
                      <v-text-field
                        label="Bandwidth Limit"
                        v-model="
                          serverInfo.virtualserverMaxUploadTotalBandwidth
                        "
                        :disabled="$store.state.query.loading"
                        type="number"
                      >
                        <template #append>
                          <div>Byte/s</div>
                        </template>
                      </v-text-field>
                      <v-text-field
                        label="Upload Quota"
                        v-model="serverInfo.virtualserverUploadQuota"
                        :disabled="$store.state.query.loading"
                        type="number"
                      >
                        <template #append>
                          <div>MiB</div>
                        </template>
                      </v-text-field>
                    </v-card-text>
                  </v-card>
                  <v-card class="my-2" outlined>
                    <v-card-subtitle>Download</v-card-subtitle>
                    <v-card-text>
                      <v-text-field
                        label="Bandwidth Limit"
                        v-model="
                          serverInfo.virtualserverMaxDownloadTotalBandwidth
                        "
                        :disabled="$store.state.query.loading"
                        type="number"
                      >
                        <template #append>
                          <div>Byte/s</div>
                        </template>
                      </v-text-field>
                      <v-text-field
                        label="Download Quota"
                        v-model="serverInfo.virtualserverDownloadQuota"
                        :disabled="$store.state.query.loading"
                        type="number"
                      >
                        <template #append>
                          <div>MiB</div>
                        </template>
                      </v-text-field>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Anti-Flood
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card class="mb-2" outlined>
                    <v-card-text>
                      <v-text-field
                        label="Reduced point per tick"
                        v-model="
                          serverInfo.virtualserverAntifloodPointsTickReduce
                        "
                        :disabled="$store.state.query.loading"
                        type="number"
                      ></v-text-field>
                      <v-text-field
                        label="Points needed to block commands"
                        v-model="
                          serverInfo.virtualserverAntifloodPointsNeededCommand_block
                        "
                        :disabled="$store.state.query.loading"
                        type="number"
                      ></v-text-field>
                      <v-text-field
                        label="Points needed to block IP"
                        v-model="
                          serverInfo.virtualserverAntifloodPointsNeededIp_block
                        "
                        :disabled="$store.state.query.loading"
                        type="number"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header> Security </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card class="mb-2" outlined>
                    <v-card-text>
                      <v-text-field
                        label="Needed Security Level"
                        v-model="
                          serverInfo.virtualserverNeededIdentitySecurityLevel
                        "
                        :disabled="$store.state.query.loading"
                        type="number"
                      ></v-text-field>
                      <v-select
                        label="Channel voice data encrypption"
                        v-model="serverInfo.virtualserverCodecEncryptionMode"
                        :items="encryptionModes"
                      ></v-select>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header> Misc </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card outlined>
                    <v-card-subtitle>Default Groups</v-card-subtitle>
                    <v-card-text>
                      <v-autocomplete
                        :items="serverGroups"
                        item-text="name"
                        item-value="sgid"
                        v-model="serverInfo.virtualserverDefaultServerGroup"
                        label="Server Group"
                        :disabled="$store.state.query.loading"
                      >
                        <template #selection="{ item }">
                          <div>{{ item.name }} ({{ item.sgid }})</div>
                        </template>
                        <template #item="{ item }">
                          <div>{{ item.name }} ({{ item.sgid }})</div>
                        </template>
                      </v-autocomplete>
                      <v-autocomplete
                        :items="channelGroups"
                        item-text="name"
                        item-value="cgid"
                        v-model="serverInfo.virtualserverDefaultChannelGroup"
                        label="Channel Group"
                        :disabled="$store.state.query.loading"
                      >
                        <template #selection="{ item }">
                          <div>{{ item.name }} ({{ item.cgid }})</div>
                        </template>
                        <template #item="{ item }">
                          <div>{{ item.name }} ({{ item.cgid }})</div>
                        </template>
                      </v-autocomplete>
                      <v-autocomplete
                        :items="channelGroups"
                        item-text="name"
                        item-value="cgid"
                        v-model="
                          serverInfo.virtualserverDefaultChannelAdminGroup
                        "
                        label="Channel Admin Group"
                        :disabled="$store.state.query.loading"
                      >
                        <template #selection="{ item }">
                          <div>{{ item.name }} ({{ item.cgid }})</div>
                        </template>
                        <template #item="{ item }">
                          <div>{{ item.name }} ({{ item.cgid }})</div>
                        </template>
                      </v-autocomplete>
                    </v-card-text>
                  </v-card>
                  <v-card class="mt-2" outlined>
                    <v-card-subtitle>Complain</v-card-subtitle>
                    <v-card-text>
                      <v-layout justify-space-between wrap>
                        <v-flex xs5 md3>
                          <v-text-field
                            label="Autoban Count"
                            :disabled="$store.state.query.loading"
                            v-model="
                              serverInfo.virtualserverComplainAutobanCount
                            "
                            type="number"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs5 md3>
                          <v-text-field
                            label="Autoban Time"
                            :disabled="$store.state.query.loading"
                            v-model="
                              serverInfo.virtualserverComplainAutobanTime
                            "
                            type="number"
                          >
                            <template #append>
                              <div>sec</div>
                            </template>
                          </v-text-field>
                        </v-flex>
                        <v-flex xs5 md3>
                          <v-text-field
                            label="Remove Time"
                            :disabled="$store.state.query.loading"
                            v-model="
                              serverInfo.virtualserverComplainRemoveTime
                            "
                            type="number"
                          >
                            <template #append>
                              <div>sec</div>
                            </template>
                          </v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-card-text>
                  </v-card>
                  <v-card class="my-2" outlined>
                    <v-card-text>
                      <v-text-field
                        label="Min clients in channel before silence"
                        :disabled="$store.state.query.loading"
                        v-model="
                          serverInfo.virtualserverMinClientsInChannel_beforeForcedSilence
                        "
                        type="number"
                      ></v-text-field>
                      <v-text-field
                        label="Priority Speaker dim modificator"
                        :disabled="$store.state.query.loading"
                        v-model="
                          serverInfo.virtualserverPrioritySpeakerDimmModificator
                        "
                        type="number"
                      ></v-text-field>
                      <v-text-field
                        label="Delete delay for temporary channel"
                        :disabled="$store.state.query.loading"
                        v-model="
                          serverInfo.virtualserverChannelTempDeleteDelay_default
                        "
                        type="number"
                      ></v-text-field>
                      <v-text-field
                        label="Phonetic Name"
                        :disabled="$store.state.query.loading"
                        v-model="serverInfo.virtualserverNamePhonetic"
                      ></v-text-field>
                      <v-checkbox
                        label="Enable reporting to serverlist"
                        v-model="weblistEnabled"
                      ></v-checkbox>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header> Logs </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card class="mb-2" outlined>
                    <v-card-subtitle>Enable Logging For</v-card-subtitle>
                    <v-card-text>
                      <v-checkbox
                        label="Clients"
                        v-model="logClient"
                      ></v-checkbox>
                      <v-checkbox
                        label="Channel"
                        v-model="logChannel"
                      ></v-checkbox>
                      <v-checkbox
                        label="Server"
                        v-model="logServer"
                      ></v-checkbox>
                      <v-checkbox
                        label="ServerQuery"
                        v-model="logQuery"
                      ></v-checkbox>
                      <v-checkbox
                        label="Permissions"
                        v-model="logPermissions"
                      ></v-checkbox>
                      <v-checkbox
                        label="File transfer"
                        v-model="logFileTransfer"
                      ></v-checkbox>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              :disabled="this.$store.state.query.loading"
              color="primary"
              @click="saveChanges"
              >OK
            </v-btn>
            <v-btn text @click="$router.go(-1)" color="primary">Cancel</v-btn>
            <v-btn
              text
              :disabled="this.$store.state.query.loading"
              color="primary"
              @click="applyChanges"
              >Apply
            </v-btn>
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
        { text: "No message", value: 0 },
        { text: "Show message in log", value: 1 },
        { text: "Show modal message", value: 2 },
        { text: "Modal message and exit", value: 3 },
      ],
      bannerModes: [
        { text: "Do not adjust", value: 0 },
        { text: "Adjust but ignore aspect ratio", value: 1 },
        { text: "Adjust and keep aspect ratio", value: 2 },
      ],
      encryptionModes: [
        { text: "Configure per Channel", value: 0 },
        { text: "Globally Off", value: 1 },
        { text: "Globally On", value: 2 },
      ],
      serverGroups: [],
      channelGroups: [],
    };
  },
  computed: {
    weblistEnabled: {
      get() {
        return this.serverInfo.virtualserverWeblistEnabled ? true : false;
      },
      set(bool) {
        this.serverInfo.virtualserverWeblistEnabled = bool ? 1 : 0;
      },
    },
    logClient: {
      get() {
        return this.serverInfo.virtualserverLogClient ? true : false;
      },
      set(bool) {
        this.serverInfo.virtualserverLogClient = bool ? 1 : 0;
      },
    },
    logQuery: {
      get() {
        return this.serverInfo.virtualserverLogQuery ? true : false;
      },
      set(bool) {
        this.serverInfo.virtualserverLogQuery = bool ? 1 : 0;
      },
    },
    logChannel: {
      get() {
        return this.serverInfo.virtualserverLogChannel ? true : false;
      },
      set(bool) {
        this.serverInfo.virtualserverLogChannel = bool ? 1 : 0;
      },
    },
    logPermissions: {
      get() {
        return this.serverInfo.virtualserverLogPermissions ? true : false;
      },
      set(bool) {
        this.serverInfo.virtualserverLogPermissions = bool ? 1 : 0;
      },
    },
    logServer: {
      get() {
        return this.serverInfo.virtualserverLogServer ? true : false;
      },
      set(bool) {
        this.serverInfo.virtualserverLogServer = bool ? 1 : 0;
      },
    },
    logFileTransfer: {
      get() {
        return this.serverInfo.virtualserverLogFiletransfer ? true : false;
      },
      set(bool) {
        this.serverInfo.virtualserverLogFiletransfer = bool ? 1 : 0;
      },
    },
  },
  methods: {
    getServerInfo() {
      return this.$TeamSpeak.execute("serverinfo").then((arr) => arr[0]);
    },
    getServerGroupList() {
      return this.$TeamSpeak
        .execute("servergrouplist")
        .then((groups) => groups.filter((group) => group.type === 1));
    },
    getChannelGroupList() {
      return this.$TeamSpeak
        .execute("channelgrouplist")
        .then((groups) => groups.filter((group) => group.type === 1));
    },
    getChanges() {
      let changes = {};

      for (let prop in this.serverInfo) {
        if (this.serverInfo[prop] !== this.serverInfoCopy[prop]) {
          changes[prop] = this.serverInfo[prop];
        }
      }

      return changes;
    },
    serverEdit() {
      return this.$TeamSpeak.execute("serveredit", this.getChanges());
    },
    async saveChanges() {
      try {
        await this.serverEdit();

        this.$router.go(-1);
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async applyChanges() {
      try {
        await this.serverEdit();
      } catch (err) {
        this.$toast.error(err.message);
      }

      this.init();
    },
    async init() {
      try {
        this.serverInfo = await this.getServerInfo();
        this.serverInfoCopy = { ...this.serverInfo };
        this.serverGroups = await this.getServerGroupList();
        this.channelGroups = await this.getChannelGroupList();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  created() {
    this.init();
  },
};
</script>
