<template lang="html">
  <v-container>
    <v-layout justify-center>
      <v-flex lg8 md10 sm10 xs12>
        <v-card>
          <v-card-text>
            <v-switch v-model="prettyPrint" label="Pretty print"></v-switch>
            <div ref="terminal" v-resize="resizeTerminal"></div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import LocalEchoController from "local-echo";

export default {
  data() {
    return {
      terminal: null,
      localEcho: null,
      prettyPrint: true,
      fitAddon: null,
    };
  },
  methods: {
    resizeTerminal() {
      this.$nextTick(() => {
        this.fitAddon.fit();
      });
    },
    renderTerminal() {
      this.terminal = new Terminal({
        cursorBlink: true,
      });
      this.fitAddon = new FitAddon();

      this.terminal.loadAddon(this.fitAddon);

      this.localEcho = new LocalEchoController(this.terminal);

      this.terminal.open(this.$refs.terminal);

      this.fitAddon.fit();

      this.terminal.focus();
    },
    async registerKeyEvents() {
      try {
        let input = await this.localEcho.read("~$");

        let response = await this.sendData(input);

        this.terminal.writeln(this.stringifyQueryResponse(response));

        this.registerKeyEvents();
      } catch (err) {
        this.terminal.writeln(this.stringifyQueryResponse(err));

        this.registerKeyEvents();
      }
    },
    stringifyQueryResponse(response) {
      // adds "carriage return" character
      // otherwise new line is not printed correctly by xterm
      return JSON.stringify(response, null, this.prettyPrint ? 2 : 0).replace(
        /\n/g,
        "\n\r"
      );
    },
    sendData(input) {
      let { command, parameters, options } = this.parseQueryRequest(input);

      return this.$TeamSpeak.execute(command, parameters, options);
    },
    parseQueryRequest(input) {
      let command = input.split(" ")[0];
      let parameters = {};
      let options = [];

      input.split(" ").forEach((val) => {
        if (/\=/.test(val)) {
          // If it contains an equal sign
          parameters[val.split(/=(.+)/)[0]] = val.split(/=(.+)/)[1];
        } else if (/^-/.test(val)) {
          // If the first character is a hyphen
          options.push(val);
        }
      });

      return { command, parameters, options };
    },
    init() {
      this.renderTerminal();
      this.registerKeyEvents();
    },
  },
  created() {
    // nextTick waits till the DOM Element is renderd.
    // Otherwise this.$refs.terminal would be undefined on created and the terminal would not render correctly
    this.$nextTick(() => {
      this.init();
    });
  },
};
</script>

<style lang="css">
@import "~xterm/css/xterm.css";
</style>
