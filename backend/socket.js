const socket = {}

socket.init = server => {
  const io = require('socket.io')(server)
  const crypto = require('crypto')
  const jwt = require('jsonwebtoken')
  const {TeamSpeak, QueryProtocol} = require('ts3-nodejs-library')

  const {logger} = require('./utils')

  // generates a random key for encrypting the jsonwebtoken
  const secret = process.env.NODE_ENV === 'development' ? '1234' : crypto.randomBytes(256).toString('base64')

  // Check if the TeamSpeak object was created.
  const checkTSConnection = TSInstance => {
    if(TSInstance instanceof TeamSpeak) {
      return
    } else {
      return new Error('Something went wrong. Please login again')
    }
  }

  // Send the response from the ServerQuery back to the frontend.
  const handleResponse = (response, fn) => {
    // By default socket.io converts the object to JSON and parses it on the client side automatically to a javascript object again.
    // Sometimes the response contains properties which are undefined. These properties would be removed because JSON have no value "undefined".
    // Because of that, all undefined properties are converted to "null" before they are emittet to the ui.
    response = JSON.stringify(response, (k, v) => v === undefined ? null : v)

    fn(JSON.parse(response))
  }

  // Send an error back to the frontend.
  const handleError = (err, fn) => {
    fn({message: err.message, ...err})
  }

  // When the client is connected to the server.
  io.on('connection', async socket => {
    let ip = socket.client.conn.remoteAddress
    let token = socket.handshake.query.token
    let log = logger.child({client: ip})
    let TSConnection = undefined

    log.info('connected to socket.io')

    // Try to reconnect to the TeamSpeak ServerQuery if a client sends a token.
    if(token) {
      try {
        let decoded = jwt.verify(token, secret)

        TSConnection = await TeamSpeak.connect(decoded)
        await TSConnection.execute('use', {sid: 1})

        log.info(`reconnected to ${decoded.host}:${decoded.queryport} => ${decoded.protocol}`)
      } catch(err) {
        log.error(err.message)

        socket.emit('TeamSpeak authentication error', err.message)
      }
    }

    // Check on every request if the TeamSpeak instance was created.
    socket.use((packet, next) => {
      if(packet[0] === 'connect TeamSpeak') return next()

      next(checkTSConnection(TSConnection))
    })

    // Connect to the ServerQuery and try to login.
    socket.on('connect TeamSpeak', async (options, fn) => {
      try {
        let connectionParams = {
          host: options.host,
          queryport: options.queryport,
          protocol: options.ssh ? QueryProtocol.SSH : QueryProtocol.RAW,
          username: options.username,
          password: options.password,
        }

        TSConnection = await TeamSpeak.connect(connectionParams)

        token = jwt.sign(connectionParams, secret)

        log.info(`connected to ${connectionParams.host}:${connectionParams.queryport} => ${connectionParams.protocol}`)

        // If the socket gets closed (e.g. when the user sends "quit" on the console or hits logout)
        TSConnection.on('close', () => socket.emit('TeamSpeak connection closed'))

        fn({token})
      } catch(err) {
        log.error(err.message)

        fn({message: err.message})
      }
    })

    // Send command to the ServerQuery. The parameters and options are optional.
    socket.on('execute', async (query, fn) => {
      let {command, params, options} = query

      log.info(query)

      try {
        let response = await TSConnection.execute(command, params, options)

        handleResponse(response, fn)
      } catch(err) {
        log.error(err.message)

        handleError(err, fn)
      }

    })

    // Create a snapshot and send it back to the client.
    socket.on('createsnapshot', async fn => {
      log.info('serversnapshotcreate')

      try {
        let response = await TSConnection.createSnapshot()

        handleResponse(response, fn)
      } catch(err) {
        log.error(err.message)

        handleError(err, fn)
      }
    })

    // Get the snapshot file and restore it.
    socket.on('deploysnapshot', async (snapshot, fn) => {
      log.info('serversnapshotdeploy')

      try {
        // (Re)encoding the sended string (snapshot) to base64.
        // This prevents crashing the sever if an invalid file is uploaded.
        let verifiedSnapshot = Buffer.from(snapshot.toString(), 'base64').toString('base64')
        let response = await TSConnection.deploySnapshot(verifiedSnapshot)

        handleResponse(response, fn)
      } catch(err) {
        log.error(err.message)

        handleError(err, fn)
      }
    })

    // When the client disconnects from the server.
    // Try to quit the connection to the ServerQuery, if the client closed the connection without logging out properly.
    socket.on('disconnect', async () => {
      log.info('disconnected from socket.io')

      if(TSConnection instanceof TeamSpeak) {
        try {
          await TSConnection.execute('quit')

          log.info('quit')
        } catch(err) {
          log.error(err.message)
        }
      }
    })
  })
}

module.exports = socket
