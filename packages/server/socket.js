const socket = {};

socket.init = (server, corsOptions) => {
  const config = require("./config");
  const fs = require("fs");
  const io = require("socket.io")(server, {
    cors: corsOptions,
  });
  const crypto = require("crypto");
  const jwt = require("jsonwebtoken");
  const { logger, whitelist, sanatizer } = require("./utils");
  const cookie = require("cookie");
  const { TeamSpeak } = require("ts3-nodejs-library");

  /**
   * Client connects automatically to the websocket server.
   */
  io.on("connection", async (socket) => {
    let ip =
      socket.handshake.headers["x-forwarded-for"] ||
      socket.client.conn.remoteAddress;
    let log = logger.child({ client: ip });
    let clientCookie = socket.handshake.headers.cookie
      ? cookie.parse(socket.handshake.headers.cookie)
      : {};
    let ServerQuery = {};

    log.info("Socket.io connected");

    /**
     * Send the TeamSpeak error message back to the frontend.
     * Check if the connection to the ServerQuery is established.
     * @param  {Object}   err - error object
     * @param  {Function} fn  - socket.io callback function
     */
    const handleServerQueryError = (err, fn) => {
      log.error(err.message);

      if (ServerQuery.query && ServerQuery.query.connected) {
        fn({
          message: err.message,
          id: err.id,
          connected: true,
        });
      } else {
        fn({
          message: err.message,
          connected: false,
        });
      }
    };

    /**
     * Handle the responses from the ServerQuery and send it to the frontend.
     * By default socket.io converts the object to JSON and parses it on the
     * client side automatically to a javascript object again.
     * Sometimes the response contains properties which are undefined.
     * These properties would be removed because JSON have no value "undefined".
     * Because of that, all undefined properties are converted to "null" before
     * they are emittet to the ui.
     * @param  {Array}   response - results from the ServerQuery
     * @param  {Function} fn      - socket.io callback function
     */
    const handleResponse = (response, fn) => {
      response = JSON.stringify(response, (k, v) => (v === undefined ? "" : v));

      fn(JSON.parse(response));
    };

    /**
     * Register all available ServerQuery events.
     */
    const initEventListeners = () => {
      ServerQuery.on("error", (err) => {
        log.error(err.stack);

        socket.emit("teamspeak-error", err);
      });
      ServerQuery.on("flooding", () => log.warn("Flooding"));
      ServerQuery.on("debug", (data) => {
        if (data.type === "send") log.info(data.data);
      });
      ServerQuery.on("close", () => {
        log.info("ServerQuery connection closed");

        ServerQuery.removeAllListeners();

        socket.emit("teamspeak-disconnect");
      });
      ServerQuery.on("clientconnect", (data) =>
        socket.emit("teamspeak-clientconnect", data)
      );
      ServerQuery.on("clientdisconnect", (data) =>
        socket.emit("teamspeak-clientdisconnect", data)
      );
      ServerQuery.on("clientmoved", (data) =>
        socket.emit("teamspeak-clientmoved", data)
      );
      ServerQuery.on("tokenused", (data) =>
        socket.emit("teamspeak-tokenused", data)
      );
      ServerQuery.on("textmessage", (data) =>
        socket.emit("teamspeak-textmessage", data)
      );
      ServerQuery.on("serveredit", (data) =>
        socket.emit("teamspeak-serveredit", data)
      );
      ServerQuery.on("channeledit", (data) =>
        socket.emit("teamspeak-channeledit", data)
      );
      ServerQuery.on("channelcreate", (data) =>
        socket.emit("teamspeak-channelcreate", data)
      );
      ServerQuery.on("channelmoved", (data) =>
        socket.emit("teamspeak-channelmoved", data)
      );
      ServerQuery.on("channeldelete", (data) =>
        socket.emit("teamspeak-channeldelete", data)
      );
    };

    /**
     * Decode the the token and send the decoded data back to the frontend.
     */
    socket.on("autofillform", (token, fn) => {
      try {
        let decoded = jwt.verify(token, config.secret);

        fn(decoded);
      } catch (err) {
        fn(err.message);
      }
    });

    /**
     * Try to reconnect to the ServerQuery.
     */
    socket.on("teamspeak-reconnect", async ({ token, serverId }, fn) => {
      try {
        let decoded = jwt.verify(token, config.secret);

        whitelist.check(decoded.host);

        ServerQuery = await TeamSpeak.connect(decoded);

        if (serverId) {
          await ServerQuery.execute("use", { sid: serverId });

          initEventListeners();
        }

        log.info("ServerQuery reconnected");

        handleResponse({ reconnected: true }, fn);
      } catch (err) {
        log.error(err.message);

        handleServerQueryError(err, fn);
      }
    });

    /**
     * Connect and login to the ServerQuery.
     * Try to pick the first available server
     */
    socket.on("teamspeak-connect", async (options, fn) => {
      try {
        const validOptions = sanatizer.sanatizeOptions(options);

        whitelist.check(validOptions.host);

        ServerQuery = await TeamSpeak.connect(validOptions);

        log.info("ServerQuery connected");

        token = jwt.sign(validOptions, config.secret);

        fn({ token });
      } catch (err) {
        handleServerQueryError(err, fn);
      }
    });

    /**
     * Send command to the ServerQuery. The parameters and options are optional.
     */
    socket.on("teamspeak-execute", async (query, fn) => {
      let { command, params, options } = query;

      try {
        let response = await ServerQuery.execute(command, params, options);

        handleResponse(response, fn);
      } catch (err) {
        handleServerQueryError(err, fn);
      }
    });

    /**
     * Create a snapshot and send it back to the client.
     */
    socket.on("teamspeak-createsnapshot", async (fn) => {
      try {
        let response = await ServerQuery.execute("serversnapshotcreate");

        handleResponse(response, fn);
      } catch (err) {
        handleServerQueryError(err, fn);
      }
    });

    /**
     * Get the snapshot file and restore it.
     */
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
        handleServerQueryError(err, fn);
      }
    });

    /**
     * Register TeamSpeak servernotifyregister. Used when a virtual server gets selected.
     */
    socket.on("teamspeak-registerevents", async (fn) => {
      try {
        // Check if the event listeners for the teamspeak notifications got already initialized.
        // If this is not the case, eventNames() will just return in Array with the value [newListener].
        // With v3 of the TS3-NodeJS-Library it registers server notifications automatically when you start listening of the events.
        // To avoid registering teamspeak notifications multiple times if a server got stopped and restarted
        // or a server got recovered from a snapshot, this check is needed.
        if (ServerQuery.eventNames().length > 1) {
          await ServerQuery.registerEvent("textserver");
          await ServerQuery.registerEvent("textchannel");
          await ServerQuery.registerEvent("textprivate");
          await ServerQuery.registerEvent("server");
          await ServerQuery.registerEvent("channel", 0);
        } else {
          // This will fire after login when no event are initialized.
          initEventListeners();
        }

        handleResponse("ok", fn);
      } catch (err) {
        handleServerQueryError(err, fn);
      }
    });

    /**
     * Unregister TeamSpeak notifications.
     */
    socket.on("teamspeak-unregisterevent", async (fn) => {
      try {
        let response = await ServerQuery.unregisterEvent();

        handleResponse(response, fn);
      } catch (err) {
        handleServerQueryError(err, fn);
      }
    });

    /**
     * Download files from the TeamSpeak server. Is used for smaller files like avatars.
     * Bigger files are handled by the api route and are piped directly to the
     * ServerQuery socket to save RAM.
     */
    socket.on("teamspeak-downloadfile", async ({ path, cid, cpw }, fn) => {
      try {
        let buffer = await ServerQuery.downloadFile(path, cid, cpw);

        handleResponse(buffer.toString("base64"), fn); // handleResponse(buffer, fn);
      } catch (err) {
        handleServerQueryError(err, fn);
      }
    });

    /**
     * When the client disconnects from the server.
     * Try to quit the connection to the ServerQuery, if the client closed the
     * connection without logging out properly.
     *
     */
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
