//when running in repl.it, client should connect without mentioning a port
//e.g.
// const socket = io.connect("https://SocketIOServerFinished.neillbogie.repl.co");

import * as cors from "cors";
import * as express from "express";
import { Server, Socket } from "socket.io";
import { makeInitialGameState, setCellAt } from "./game";
import { PlayerId } from "./types";
//set up socket.io - boilerplate (same each time)
import * as http from "http";

const app = express();
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
