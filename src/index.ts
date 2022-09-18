//when running in repl.it, client should connect without mentioning a port
//e.g.
// const socket = io.connect("https://SocketIOServerFinished.neillbogie.repl.co");

import * as cors from "cors";
import * as express from "express";
import { Server, Socket } from "socket.io";
import { makeInitialGameState, setCellAt } from "./game";
import { GameState, PlayerId } from "./types";
//set up socket.io - boilerplate (same each time)
import * as http from "http";
import { collect, pick } from "./utils";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
interface Room {
    id: string;
    players: PlayerId[];
    gameState: GameState;
}
interface RoomsDict {
    [roomId: string]: Room;
}

let rooms: RoomsDict = {};

app.use(cors());
app.use(express.json());
io.on("connection", (s: Socket) => {
    console.log("got connection.  registering handlers");

    s.on("listRooms", () => {
        console.log("client requested rooms");
        s.emit("roomsList", rooms);
    });

    function generateRandomRoomId() {
        return collect(5, () =>
            pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(""))
        ).join("");
    }
    s.on("createAndJoinRoom", () => {
        console.log("client creating and joining room");
        const roomId = generateRandomRoomId();
        const room: Room = {
            id: roomId,
            gameState: makeInitialGameState(),
            players: ["p1"],
        };
        rooms[room.id] = room;
        s.emit("givePlayerId", "p1", room.id);
        s.join(room.id);
        io.emit("roomsList", rooms);
        io.to(room.id).emit("update", room.gameState);
    });

    s.on("joinRoom", (roomId: string) => {
        console.log("client tried to join room ", roomId);
        const room = rooms[roomId];
        if (room.players.length < 2) {
            s.emit("givePlayerId", "p2", room.id);
            s.join(room.id);
            room.players.push("p2");
            io.to(room.id).emit("update", room.gameState);
            io.emit("roomsList", rooms);
        } else {
            console.log("game full");
            s.emit("noSpaceInGame");
            s.emit("roomsList", rooms);
        }
    });

    s.on(
        "cellClicked",
        (roomId: string, cellIndex: number, whoseTurn: string) => {
            console.log("got socket msg: ", { roomId, cellIndex, whoseTurn });
            const room = rooms[roomId];
            if (!room) {
                s.emit("error", "No such room.  Perhaps the server restarted?");
                return;
            }
            room.gameState = setCellAt(cellIndex, whoseTurn, room.gameState);
            io.to(room.id).emit("update", room.gameState);
        }
    );
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
