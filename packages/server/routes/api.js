/**
 * API routes are only used for download and upload streams.
 * The main communication between the client (frontend) and the ServerQuery is
 * still handled by socket.io.
 */

const config = require("../config");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { TeamSpeak } = require("ts3-nodejs-library");
const { logger, whitelist } = require("../utils");
const { Socket } = require("net");
const Busboy = require("busboy");
const Path = require("path");
const fetch = require("node-fetch");

/**
 * Get the ip address or hostname of the TeamSpeak server by decoding the cookie
 * on every request.
 */
router.use(async (req, res, next) => {
  let { token, serverId } = req.cookies;
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let log = logger.child({ client: ip });

  res.locals.log = log;

  try {
    let decoded = jwt.verify(token, config.secret);

    whitelist.check(decoded.host);

    res.locals.host = decoded.host;

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Download file from the server.
 */
router.get("/download", async (req, res, next) => {
  let { ftkey, port, size, name } = req.query;
  let { log, host } = res.locals;
  let socket = new Socket();

  try {
    socket.connect(port, host);

    socket.on("connect", () => {
      res.setHeader("content-disposition", `attachment; filename=${name}`);
      res.setHeader("content-length", size);

      socket.write(ftkey);

      log.info(`Downloading file ${name}`);

      socket.pipe(res);
    });

    socket.on("error", (err) => {
      socket.destroy();

      next(err);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Upload file to the server
 */
router.post("/upload", async (req, res, next) => {
  let ftkey = req.headers["x-file-transfer-key"];
  let port = req.headers["x-file-transfer-port"];
  let { log, host } = res.locals;
  let busboy = new Busboy({ headers: req.headers });
  let socket = new Socket();

  try {
    busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
      socket.setTimeout(5000);

      socket.connect(port, host);

      socket.on("connect", () => {
        socket.write(ftkey);

        log.info(`Start uploading file "${filename}"`);

        file.pipe(socket);
      });

      socket.on("error", async (err) => {
        socket.destroy();

        next(err);
      });

      socket.on("timeout", () => {
        log.info(`Stopped uploading file "${filename}"`);

        socket.end();
      });

      busboy.on("finish", async () => {
        log.info(`Finished uploading file "${filename}"`);

        socket.end();

        res.sendStatus(200);
      });
    });

    req.pipe(busboy);
  } catch (err) {
    next(err);
  }
});

/**
 * Get newest available TeamSpeak server versions.
 * The fetch is run on the server side to bypass CORS restrictions on the client side.
 */
router.get("/teamspeak-versions", async (req, res, next) => {
  try {
    let data = await fetch(
      "https://www.teamspeak.com/versions/server.json"
    ).then((data) => data.json());

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * Handle errors.
 * This middleware needs to have 4 arguments in the callback function.
 * Otherwise express.js will not handle it as an error middleware.
 */
router.use((error, req, res, next) => {
  let { log } = res.locals;

  log.error(error.message);

  res.status(400).send(error.message);
});

module.exports = router;
