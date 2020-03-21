const socket = {};

socket.init = server => {
  const io = require("socket.io")(server);
  const crypto = require("crypto");
  const jwt = require("jsonwebtoken");
  const {TeamSpeak} = require("ts3-nodejs-library");
  let ServerQuery;

  const {logger} = require("./utils");

  // generates a random key for encrypting the jsonwebtoken
  const secret =
    process.env.NODE_ENV === "development"
      ? "1234"
      : crypto.randomBytes(256).toString("base64");

  const registerEvents = (instance, logger, socket) => {
    instance.on("error", err => {
      logger.error(err.stack);

      socket.emit("teamspeak_error", err.message);
    });
    instance.on("flooding", () => logger.warn("Flooding"));
    instance.on("debug", data => {
      if (data.type === "send") logger.info(data.data);
    });
    instance.on("close", () => {
      logger.info("ServerQuery connection closed");

      instance.removeAllListeners();
    });
    instance.on("clientconnect", data =>
      socket.emit("teamspeak-clientconnect", data)
    );
    instance.on("clientdisconnect", data =>
      socket.emit("teamspeak-clientdisconnect", data)
    );
    instance.on("clientmoved", data =>
      socket.emit("teamspeak-clientmoved", data)
    );
    instance.on("tokenused", data => socket.emit("teamspeak-tokenused", data));
    instance.on("textmessage", data =>
      socket.emit("teamspeak-textmessage", data)
    );
    instance.on("serveredit", data =>
      socket.emit("teamspeak-serveredit", data)
    );
    instance.on("channeledit", data =>
      socket.emit("teamspeak-channeledit", data)
    );
    instance.on("channelcreate", data =>
      socket.emit("teamspeak-channelcreate", data)
    );
    instance.on("channelmoved", data =>
      socket.emit("teamspeak-channelmoved", data)
    );
    instance.on("channeldelete", data =>
      socket.emit("teamspeak-channeldelete", data)
    );
  };

  // Send the response from the ServerQuery back to the frontend.
  const handleResponse = (response, fn) => {
    // By default socket.io converts the object to JSON and parses it on the client side automatically to a javascript object again.
    // Sometimes the response contains properties which are undefined. These properties would be removed because JSON have no value "undefined".
    // Because of that, all undefined properties are converted to "null" before they are emittet to the ui.
    response = JSON.stringify(response, (k, v) => (v === undefined ? "" : v));

    fn(JSON.parse(response));
  };

  // Send an error back to the frontend.
  const handleError = (err, fn) => {
    fn({message: err.message, ...err});
  };

  // Try to reconnect if a token was send by the client
  io.use(async (socket, next) => {
    if (socket.handshake.query.hasOwnProperty("token")) {
      let {token, serverId} = socket.handshake.query;
      let ip = socket.client.conn.remoteAddress;
      let log = logger.child({client: ip});

      try {
        let decoded = jwt.verify(token, secret);

        ServerQuery = await TeamSpeak.connect(decoded);

        if (serverId) await ServerQuery.execute("use", {sid: serverId});

        registerEvents(ServerQuery, log, socket);

        socket.emit("teamspeak-reconnected");

        log.info("ServerQuery reconnected");

        return next();
      } catch (err) {
        return next(new Error(err.message));
      }
    }

    return next();
  });

  // When the client is connected to the server.
  io.on("connection", async socket => {
    let ip = socket.client.conn.remoteAddress;
    let token = socket.handshake.query.token;
    let log = logger.child({client: ip});

    log.info("Socket.io connected");

    socket.on("autofillform", (token, fn) => {
      try {
        let decoded = jwt.verify(token, secret);

        fn(decoded);
      } catch (err) {
        fn(err.message);
      }
    });

    // Connect to the ServerQuery and try to login.
    socket.on("teamspeak-connect", async (options, fn) => {
      try {
        ServerQuery = await TeamSpeak.connect(options);

        log.info("ServerQuery connected");

        token = jwt.sign(options, secret);

        registerEvents(ServerQuery, log, socket);

        fn({token});
      } catch (err) {
        handleError(err, fn);
      }
    });

    // Send command to the ServerQuery. The parameters and options are optional.
    socket.on("teamspeak-execute", async (query, fn) => {
      let {command, params, options} = query;

      try {
        let response = await ServerQuery.execute(command, params, options);

        handleResponse(response, fn);
      } catch (err) {
        handleError(err, fn);
      }
    });

    // Create a snapshot and send it back to the client.
    socket.on("teamspeak-createsnapshot", async fn => {
      try {
        let response = await ServerQuery.createSnapshot();

        handleResponse(response, fn);
      } catch (err) {
        handleError(err, fn);
      }
    });

    // Get the snapshot file and restore it.
    socket.on("teamspeak-deploysnapshot", async (snapshot, fn) => {
      try {
        // (Re)encoding the sended string (snapshot) to base64.
        // This prevents crashing the sever if an invalid file is uploaded.
        let verifiedSnapshot = Buffer.from(
          snapshot.toString(),
          "base64"
        ).toString("base64");
        let response = await ServerQuery.deploySnapshot(verifiedSnapshot);

        handleResponse(response, fn);
      } catch (err) {
        handleError(err, fn);
      }
    });

    socket.on("teamspeak-registerevent", async ({event, id}, fn) => {
      try {
        let response = await ServerQuery.registerEvent(event, id);

        handleResponse(response, fn);
      } catch (err) {
        handleError(err, fn);
      }
    });

    socket.on("teamspeak-unregisterevent", async fn => {
      try {
        let response = await ServerQuery.unregisterEvent();

        handleResponse(response, fn);
      } catch (err) {
        handleError(err, fn);
      }
    });

    // When the client disconnects from the server.
    // Try to quit the connection to the ServerQuery, if the client closed the connection without logging out properly.
    socket.on("disconnect", async () => {
      log.info("Socket.io disconnected");

      if (ServerQuery instanceof TeamSpeak) {
        try {
          await ServerQuery.execute("quit");
        } catch (err) {
          log.error(err.message);
        }
      }
    });
  });
};

module.exports = socket;
