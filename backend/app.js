// Read .env file
require('dotenv').config()

const config = require('./config')
const path = require('path')
const express = require('express')
const app = express()
const socket = require('./socket')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const routes = require("./routes")


// Enable cross-origin resource sharing for the frontend in developement
if(process.env.NODE_ENV === "developement") {
  app.use(cors({
    origin: 'http://127.0.0.1:8080',
    credentials: true
  }))
}

app.use(cookieParser())

app.use(express.static(path.join(__dirname, '../frontend/dist/')))

app.use("/api", routes.api)

app.get('/*', (req, res) => {
  // path must be absolute or specify root to res.sendFile
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://127.0.0.1:${config.port}`)
})

socket.init(server)
