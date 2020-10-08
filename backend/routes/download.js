const express = require("express")
const router = express.Router()
const cors = require('cors')
const jwt = require("jsonwebtoken")
const {TeamSpeak} = require("ts3-nodejs-library")
const {Readable} = require('stream')
const {logger} = require("../utils")

router.get('/', cors(), async (req, res) => {
  let {token, path, name, cid, sid} = req.query
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  let log = logger.child({client: ip})

  res.setHeader('Content-disposition', `attachment; filename=${name}`)

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET)

    let ServerQuery = await TeamSpeak.connect(decoded)

    ServerQuery.on("debug", data => {
      if (data.type === "send") log.info(data.data)
    })

    await ServerQuery.execute("use", {sid})

    // Channel password is not needed as a serveradmin
    let fileBuffer = await ServerQuery.downloadFile(path, cid, "")

    // Node >v10.17.0 required
    Readable.from(fileBuffer).pipe(res)

    await ServerQuery.execute("quit")
  } catch(err) {
    log.error(err.message)

    res.send(err)
  }
})

module.exports = router
