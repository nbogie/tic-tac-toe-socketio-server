import { collect } from "./collect";
import { GameState, PlayerId } from "./types";

function makeInitialGameState(): GameState {
  return {
    whoseTurn: "p1",
    cells: collect(9, (ix) => ({ index: ix, status: "empty" })),
  };
}

function nextPlayer(current: PlayerId): PlayerId {
  return current === "p1" ? "p2" : "p1";
}

export { makeInitialGameState, nextPlayer };
