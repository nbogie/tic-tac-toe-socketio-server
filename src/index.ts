//when running in repl.it, client should connect without mentioning a port
//e.g.
// const socket = io.connect("https://SocketIOServerFinished.neillbogie.repl.co");

const express = require("express");
const app = express();
const cors = require("cors");
//set up socket.io - boilerplate (same each time)
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
io.on("connection", (s) => {
  console.log("got connection.  registering handlers");

  s.on("cellClicked", (cellIndex) => {
    console.log("got socket msg: ", { cellIndex });
    console.log("but from whom??");
  });

  s.on("partial-input", (txt) => console.log("got partial input: ", txt));
});
//our "database"
const gameState = makeInitialGameState();

app.get("/", (req, res) => {
  io.emit("req", "GET /"); //let observers know we got a request
  res.send("hi");
});

setInterval(() => {
  io.emit("time", new Date().toString());
}, 10000);

console.log("registered listeners");
const port = process.env.PORT || 4000;

//important: call listen on the server, not the app.
server.listen(port, () => {
  console.log("tictactoe server listening on *:" + port);
});
