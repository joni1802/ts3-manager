// Read .env file
require('dotenv').config()

const path = require('path')
const express = require('express')
const app = express()
const socket = require('./socket')

app.use(express.static(path.join(__dirname, '../frontend/dist/')))

app.get('/*', (req, res) => {
  // path must be absolute or specify root to res.sendFile
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on http://127.0.0.1:${process.env.PORT || 3000}`)
})

socket.init(server)
