<template>
  <v-container>
    <v-layout>
      <v-flex lg6 md8 sm10 xs12 offset-lg3 offset-md2 offset-sm1>
        <v-card>
          <v-card-title>
            {{ title }}
          </v-card-title>
          <v-card-text>
            <div v-if="spacer">
              <v-select
                label="Special Spacer"
                :items="specialSpacerList"
                v-model="specialSpacer"
                :disabled="!!spacerAlignment || !!spacerText"
              >
                <template #item="{ item }">
                  <spacer-special :characterBlock="item"></spacer-special>
                </template>
              </v-select>

              <v-row>
                <v-col>
                  <v-select
                    label="Alignment"
                    :items="spacerAlignmentList"
                    v-model="spacerAlignment"
                    :disabled="!!specialSpacer"
                  >
                  </v-select>
                </v-col>
                <v-col>
                  <v-text-field
                    label="Text"
                    v-model="spacerText"
                    :disabled="!!specialSpacer"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
            </div>

            <v-text-field
              v-else
              label="Name"
              v-model="channelName"
              :disabled="$store.state.query.loading"
            >
            </v-text-field>

            <v-text-field
              type="password"
              label="Password"
              v-model="channelPassword"
              :disabled="$store.state.query.loading"
            ></v-text-field>
            <v-text-field
              label="Topic"
              v-model="channelTopic"
              :disabled="$store.state.query.loading"
            ></v-text-field>
            <v-textarea
              label="Description"
              v-model="channelDescription"
              :disabled="$store.state.query.loading"
            ></v-textarea>
            <v-expansion-panels accordion flat>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  More Options
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card outlined>
                    <v-card-text>
                      <v-layout wrap>
                        <v-flex xs12>
                          <v-autocomplete
                            :items="channelOrderSelection"
                            label="Sort This Channel After"
                            v-model="selectedChannelOrder"
                            :disabled="$store.state.query.loading"
                          ></v-autocomplete>
                        </v-flex>
                        <v-flex md4>
                          <v-radio-group
                            label="Max Users"
                            v-model="channelUnlimitedClients"
                          >
                            <v-radio label="Unlimited" :value="1"></v-radio>
                            <v-radio label="Limited" :value="0"></v-radio>
                          </v-radio-group>
                          <v-text-field
                            label="Number Of Clients"
                            v-model="channelMaxClients"
                            :disabled="!!channelUnlimitedClients"
                          ></v-text-field>
                        </v-flex>
                        <v-flex md4>
                          <v-radio-group
                            label="Channel Type"
                            v-model="channelType"
                          >
                            <v-radio
                              label="Temporary"
                              value="temporary"
                            ></v-radio>
                            <v-radio
                              label="Permanent"
                              value="permanent"
                            ></v-radio>
                            <v-radio
                              label="Semi-Permanent"
                              value="semi-permanent"
                            ></v-radio>
                          </v-radio-group>
                        </v-flex>
                        <v-flex md4>
                          <v-checkbox
                            label="Default Channel"
                            v-model="channelIsDefault"
                            :disabled="!!initChannelData.channel_flag_default"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex md4>
                          <v-checkbox
                            label="Voice Data encrypted"
                            v-model="channelIsUnencrypted"
                          ></v-checkbox>
                        </v-flex>
                      </v-layout>
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
              @click="save"
              :disabled="this.$store.state.query.loading"
              color="primary"
              >OK</v-btn
            >
            <v-btn text @click="$router.go(-1)" color="primary">Cancel</v-btn>
            <v-btn
              text
              @click="save"
              :disabled="this.$store.state.query.loading"
              color="primary"
              :class="{ 'd-none': !applyButton }"
              >Apply</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
// Dynamic importing the component will throw an error when used in the v-select component
import SpacerSpecial from "@/components/SpacerSpecial";

export default {
  components: {
    SpacerSpecial,
  },
  props: {
    title: String,
    applyButton: {
      type: Boolean,
      default: false,
    },
    channel: {
      type: Object,
      // Object or array defaults must be returned from a factory function
      // See: https://vuejs.org/v2/guide/components-props.html
      default() {
        return {};
      },
    },
    spacer: Boolean,
  },
  data() {
    return {
      initChannelData: {},
      channels: [],
      parentChannelId: this.$route.query.pid ? +this.$route.query.pid : 0,
      serverInfo: {},
      specialSpacerList: ["", "---", "...", "-.-", "___", "-.."],
      specialSpacer: "",
      spacerAlignmentList: [
        { text: "", value: "" },
        { text: "left", value: "l" },
        { text: "center", value: "c" },
        { text: "right", value: "r" },
      ],
      spacerAlignment: "",
      spacerText: "",
    };
  },
  computed: {
    channelOrderSelection() {
      let rootChannelName = {};
      let siblingChannels = this.channels
        .filter((channel) => {
          return (
            channel.pid === this.parentChannelId &&
            channel.cid !== +this.$route.params.cid
          );
        })
        .map((channel) => ({ text: channel.channel_name, value: channel.cid }));

      // If the current channel is a sub channel
      if (this.parentChannelId !== 0) {
        let rootChannel = this.channels.find(
          (channel) => channel.cid === this.parentChannelId
        );

        rootChannelName = rootChannel && rootChannel.channel_name;
        // siblingChannels.unshift({text: parentChannel && parentChannel.channel_name, value: 0})
      } else {
        rootChannelName = this.serverInfo.virtualserver_name;
        // siblingChannels.unshift({text: this.serverInfo.virtualserver_name, value: 0})
      }

      siblingChannels.unshift({ text: rootChannelName, value: 0 });

      return siblingChannels;
    },
    selectedChannelOrder: {
      get() {
        return this.channel.channel_order && this.channel.channel_order;
      },
      set(cid) {
        this.channel.channel_order = cid;
      },
    },
    channelName: {
      get() {
        return this.channel.channel_name && this.channel.channel_name;
      },
      set(name) {
        this.channel.channel_name = name;
      },
    },
    channelPassword: {
      get() {
        return this.channel.channel_password && this.channel.channel_password;
      },
      set(password) {
        this.channel.channel_password = password;
      },
    },
    channelTopic: {
      get() {
        return this.channel.channel_topic && this.channel.channel_topic;
      },
      set(topic) {
        this.channel.channel_topic = topic;
      },
    },
    channelDescription: {
      get() {
        return (
          this.channel.channel_description && this.channel.channel_description
        );
      },
      set(description) {
        this.channel.channel_description = description;
      },
    },
    channelUnlimitedClients: {
      get() {
        return (
          this.channel.channel_flag_maxclients_unlimited &&
          this.channel.channel_flag_maxclients_unlimited
        );
      },
      set(limited) {
        this.channel.channel_flag_maxclients_unlimited = +limited;
      },
    },
    channelType: {
      get() {
        if (this.channel.channel_flag_permanent) {
          return "permanent";
        } else if (this.channel.channel_flag_semi_permanent) {
          return "semi-permanent";
        } else {
          return "temporary";
        }
      },
      set(type) {
        if (type === "permanent") {
          this.channel.channel_flag_semi_permanent = 0;
          this.channel.channel_flag_permanent = 1;
        } else if (type === "semi-permanent") {
          this.channel.channel_flag_semi_permanent = 1;
          this.channel.channel_flag_permanent = 0;
        } else {
          this.channel.channel_flag_semi_permanent = 0;
          this.channel.channel_flag_permanent = 0;
        }
      },
    },
    channelMaxClients: {
      get() {
        return (
          this.channel.channel_maxclients && this.channel.channel_maxclients
        );
      },
      set(number) {
        this.channel.channel_maxclients = number;
      },
    },
    channelIsUnencrypted: {
      get() {
        return typeof this.channel.channel_codec_is_unencrypted !== "undefined"
          ? !!!this.channel.channel_codec_is_unencrypted
          : false;
      },
      set(encrypted) {
        this.channel.channel_codec_is_unencrypted = +!encrypted;
      },
    },
    channelIsDefault: {
      get() {
        return (
          this.channel.channel_flag_default && this.channel.channel_flag_default
        );
      },
      set(flag) {
        this.channel.channel_flag_default = +flag;
      },
    },
  },
  methods: {
    setSpacer() {
      let randomId = Math.floor(Math.random() * 100);

      this.channel.channel_name = `[${this.spacerAlignment}spacer${randomId}]${
        this.specialSpacer || this.spacerText
      }`;
    },
    getServerInfo() {
      return this.$TeamSpeak.execute("serverinfo").then((arr) => arr.pop());
    },
    getChannelList() {
      return this.$TeamSpeak.execute("channellist");
    },
    getChanges() {
      let changes = {};

      for (let prop in this.channel) {
        if (this.channel[prop] !== this.initChannelData[prop]) {
          changes[prop] = this.channel[prop];
        }
      }

      return changes;
    },
    save(e) {
      if (this.spacer) this.setSpacer();

      this.$emit("save", this.getChanges(), e);

      if (e.target.textContent.toLowerCase() === "apply") {
        // Save initial channel properties again because they got changed
        let unwatch = this.$watch("channel", (channel) => {
          this.initChannelData = { ...channel };

          unwatch();
        });
      }
    },
  },
  async created() {
    // Save initial channel properties to only submit the changes when hitting save.
    let unwatch = this.$watch(
      "channel",
      (channel) => {
        if (channel) {
          this.initChannelData = { ...this.channel };

          // Need to check for unwatch otherwise it will cause an error
          // See https://vuejs.org/v2/api/#vm-watch
          if (unwatch) unwatch();
        }
      },
      { immediate: true }
    );

    try {
      this.channels = await this.getChannelList();
      this.serverInfo = await this.getServerInfo();
    } catch (err) {
      this.$toast.error(err.message);
    }
  },
};
</script>
