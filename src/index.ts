//when running in repl.it, client should connect without mentioning a port
//e.g.
// const socket = io.connect("https://SocketIOServerFinished.neillbogie.repl.co");

import { Socket } from "socket.io";
import { makeInitialGameState, nextPlayer } from "./game";
import * as express from "express";
import * as cors from "cors";
import { Server } from "socket.io";
import { Cell, GameState, PlayerId } from "./types";

const app = express();
//set up socket.io - boilerplate (same each time)
const http = require("http");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
let nextPlayerIdToGive: PlayerId | null = "p1";
let gameState = makeInitialGameState();

app.use(cors());
app.use(express.json());
io.on("connection", (s: Socket) => {
  console.log("got connection.  registering handlers");
  s.on("join", () => {
    console.log("client joined");
    if (nextPlayerIdToGive) {
      console.log("assigning player id");
      s.emit("givePlayerId", nextPlayerIdToGive);
      nextPlayerIdToGive = nextPlayerIdToGive === "p1" ? "p2" : null;
    } else {
      console.log("game full");
      s.emit("noSpaceInGame");
    }
  });

  s.on("cellClicked", (cellIndex: number, whoseTurn: string) => {
    console.log("got socket msg: ", { cellIndex, whoseTurn });
    gameState = setCellAt(cellIndex, whoseTurn, gameState);
    io.emit("update", gameState);
  });

  s.on("restartClicked", () => {
    console.log("got restartClicked");
    gameState = makeInitialGameState();
    nextPlayerIdToGive = "p1";
    io.emit("update", gameState);
  });

  s.on("partial-input", (txt: string) =>
    console.log("got partial input: ", txt)
  );
  io.emit("update", gameState);
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
function setCellAt(
  cellIndex: number,
  whoPlayed: string,
  gameState: GameState
): GameState {
  if (gameState.whoseTurn !== whoPlayed) {
    return gameState;
  }
  const foundCell = gameState.cells.find((c) => c.index === cellIndex);

  if (!foundCell) {
    return gameState;
  }
  if (foundCell.status !== "empty") {
    return gameState;
  }
  const newCell: Cell = {
    ...foundCell,
    status: whoPlayed === "p1" ? "X" : "O",
  };
  const retVal: GameState = {
    ...gameState,
    cells: gameState.cells.map((c) =>
      c.index === newCell.index ? newCell : c
    ),
    whoseTurn: nextPlayer(gameState.whoseTurn),
  };
  return retVal;
}
