// Read .env file
require("dotenv").config();

const config = require("./config");
const path = require("path");
const express = require("express");
const app = express();
const socket = require("./socket");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes");

// Enable cross-origin resource sharing for the frontend in development
const corsOptions = {
  origin: process.env.NODE_ENV === "development" ? true : false,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../frontend/dist/")));

app.use("/api", routes.api);

app.get("/*", (req, res) => {
  // path must be absolute or specify root to res.sendFile
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://127.0.0.1:${config.port}`);
});

socket.init(server, corsOptions);
