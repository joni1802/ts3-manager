/**
 * API routes are only used for download and upload streams.
 * The main communication between the client (frontend) and the ServerQuery is
 * still handled by socket.io.
 */

const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const {TeamSpeak} = require("ts3-nodejs-library")
const {logger} = require("../utils")
const {Socket} = require("net")
const Busboy = require('busboy')
const Path = require("path")

/**
 * Authenticate every request and try to connect to the ServerQuery.
 */
router.use(async (req, res, next) => {
  let {token, serverId} = req.cookies
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let log = logger.child({client: ip})

  res.locals.log = log

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET)

    let ServerQuery = await TeamSpeak.connect(decoded)

    await ServerQuery.execute("use", {sid: serverId})

    res.locals.ServerQuery = ServerQuery

    log.info("API request authenticated")

    next()
  } catch(err) {
    next(err)
  }
})

/**
 * Download file from the server.
 */
router.get("/download", async (req, res, next) => {
  let {path, name, cid} = req.query
  let {ServerQuery, log} = res.locals
  let receivedBytes = 0
  let socket = new Socket()

  try {
    // Even on Windows TeamSpeak uses only POSIX specifc paths
    let {ftkey, port, size} = await ServerQuery.ftInitDownload({cid, name: Path.posix.join(path, name)})

    socket.connect(port, ServerQuery.config.host)

    socket.on("connect", () => {
      res.setHeader("content-disposition", `attachment; filename=${name}`)
      res.setHeader("content-length", size)

      socket.write(ftkey)

      log.info(`Downloading File "${name}"`)

      socket.pipe(res)
    })

    socket.on("end", async () => {
      socket.end()

      await ServerQuery.execute("quit")
    })

    socket.on("error", async (err) => {
      socket.destroy()

      await ServerQuery.execute("quit")

      next(err)
    })
  } catch(err) {
    next(err)
  }
})

/**
 * Upload file to the server
 */
router.post("/upload", async (req, res, next) => {
  let {path, cid} = req.query
  let size = req.headers["content-length"]
  let {ServerQuery, log} = res.locals
  let busboy = new Busboy({headers: req.headers})
  let socket = new Socket()

  try {
    busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
      let {port, ftkey} = await ServerQuery.ftInitUpload({name: Path.posix.join(path, filename), cid, size})

      socket.connect(port, ServerQuery.config.host)

      socket.on("connect", () => {
        socket.write(ftkey)

        log.info(`Uploading File "${filename}" to "${path}"`)

        file.pipe(socket)
      })

      socket.on("error", async (err) => {
        socket.destroy()

        await ServerQuery.execute("quit")

        next(err)
      })

      busboy.on("finish", async () => {
        log.info(`File "${filename}" successfully uploaded`)

        socket.end()

        await ServerQuery.execute("quit")

        res.sendStatus(200)
      })

    })

    req.pipe(busboy)
  } catch(err) {
    next(err)
  }
})

/**
 * Handle errors.
 * This middleware needs to have 4 arguments in the callback function.
 * Otherwise express.js will not handle it as an error middleware.
 */
router.use((error, req, res, next) => {
  let {log} = res.locals

  log.error(error.message)

  res.status(400).send(error.message)
})

module.exports = router
