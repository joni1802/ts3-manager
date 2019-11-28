const path = require('path')
const crypto = require('crypto')
// generates a random key for encrypting the jsonwebtoken
const secret = process.env.NODE_ENV === 'development' ? '1234' : crypto.randomBytes(256).toString('base64')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const jwt = require('jsonwebtoken')
const {TeamSpeak} = require('ts3-nodejs-library')
const {logger} = require('./utils')

app.use(express.static(path.join(__dirname, '../frontend/dist/')))

app.get('/*', (req, res) => {
  // path must be absolute or specify root to res.sendFile
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

io.on('connection', async (socket) => {
  let ip = socket.client.conn.remoteAddress
  let token = socket.handshake.query.token
  let log = logger.child({client: ip})
  let teamSpeakConnection = undefined

  log.info('connected to socket.io')

  // Try to reconnect to the TeamSpeak ServerQuery if a client sends a token.
  if(token) {
    try {
      let decoded = jwt.verify(token, secret)

      teamSpeakConnection = await TeamSpeak.connect(decoded)
      await teamSpeakConnection.execute('use', {sid: 1})

      log.info(`reconnected to ${decoded.host}:${decoded.port}`)
    } catch(err) {
      log.error(err.message)

      socket.emit('TeamSpeak authentication error', err.message)
    }
  }

  // Connect to the ServerQuery and try to login.
  socket.on('connect TeamSpeak', async (options, fn) => {
    try {
      teamSpeakConnection = await TeamSpeak.connect(options)

      token = jwt.sign(options, secret)

      log.info(`connected to ${options.host}:${options.port}`)

      // If the socket gets closed (e.g. when the user sends "quit" on the console or hits logout)
      teamSpeakConnection.on('close', () => socket.emit('TeamSpeak connection closed'))

      fn({token})
    } catch(err) {
      log.error(err.message)

      fn({error: err.message})
    }
  })

  // Send command to the ServerQuery. The parameters and options are optional.
  socket.on('query TeamSpeak', async (query, fn) => {
    if(teamSpeakConnection instanceof TeamSpeak) {
      let {command, params, options} = query

      log.info(query)

      try {
        let response = await teamSpeakConnection.execute(command, params, options)

        // By default socket.io converts the object to JSON and parses it on the client side automatically to a javascript object again.
        // Sometimes the response contains properties which are undefined. These properties would be removed because JSON have no value "undefined".
        // Because of that, all undefined properties are converted to "null" before they are emittet to the frontend.
        response =  JSON.stringify(response, (k, v) => v === undefined ? null : v)
        response = JSON.parse(response)

        fn(response)
      } catch(err) {
        log.error(err.message)

        fn({message: err.message, ...err})
      }
    } else {
      log.error('TeamSpeak instance not created')

      socket.emit('TeamSpeak connection error', 'Please login again')
    }
  })

  socket.on('disconnect', async () => {
    log.info('disconnected from socket.io')

    if(teamSpeakConnection instanceof TeamSpeak) {
      try {
        await teamSpeakConnection.execute('quit')

        log.info('quit')
      } catch(err) {
        log.error(err.message)
      }
    }
  })
})

http.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on http://127.0.0.1:${process.env.PORT || 3000}`)
})
