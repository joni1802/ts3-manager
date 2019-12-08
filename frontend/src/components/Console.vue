<template lang="html">
  <v-container>
    <v-layout justify-center>
      <v-flex lg8 md10 sm10 xs12>
        <v-card>
          <v-card-text>
            <v-switch v-model="prettyPrint" label="Pretty print"></v-switch>
            <div ref="terminal"></div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {Terminal} from 'xterm'
import {LocalEchoController} from '../utils'

export default {
  data() {
    return {
      terminal: null,
      localEcho: null,
      prettyPrint: true
    }
  },
  methods: {
    renderTerminal() {
      this.terminal = new Terminal({
        cursorBlink: true,
      })
      this.localEcho = new LocalEchoController(this.terminal)

      this.terminal.open(this.$refs.terminal)
      this.terminal.focus()
    },
    async registerKeyEvents() {
      try {
        let input = await this.localEcho.read('~$')

        let response = await this.sendData(input)

        this.terminal.writeln(this.formatResponse(response))

        this.registerKeyEvents()
      } catch(err) {
        // If it is a ServerQuery error
        if(err.id) {
          this.terminal.writeln('error ' + this.formatResponse([{
            id: err.id,
            msg: err.message
          }]))
        } else {
          this.terminal.writeln(err.message)
        }

        this.registerKeyEvents()
      }
    },
    sendData(input) {
      let {command, parameters, options} = this.preparedCommand(input)

      return this.$TeamSpeak.execute(command, parameters, options)
    },
    formatResponse(response) {
      return response.map(obj => {
        let string = this.prettyPrint ? '\r\n' : ''

        for(let [prop, val] of Object.entries(obj)) {
          if(this.prettyPrint) {
            string += `${prop}: ${val}\r\n`
          } else {
            string += `${prop}=${val} `
          }
        }

        return string
      }).join('| ')
    },
    preparedCommand(input) {
      let command = input.split(' ')[0]
      let parameters = {}
      let options = []

      input.split(' ').forEach(val => {
        if(/\=/.test(val)) { // If it contains an equal sign
          parameters[val.split(/=(.+)/)[0]] = val.split(/=(.+)/)[1]
        } else if(/^-/.test(val)) { // If the first character is a hyphen
          options.push(val)
        }
      })

      return {command, parameters, options}
    },
    init() {
      this.renderTerminal()
      this.registerKeyEvents()
    },
  },
  created() {
    // nextTick waits till the DOM Element is renderd.
    // Otherwise this.$refs.terminal would be undefined on created and the terminal would not render correctly
    this.$nextTick(() => {
      this.init()
    })
  }
}
</script>

<style lang="css">
@import '../../node_modules/xterm/css/xterm.css';
</style>
