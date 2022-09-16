import { collect } from "./collect";
import { GameState } from "./types";

function makeInitialGameState(): GameState {
  return {
    whoseTurn: "p1",
    cells: collect(9, (ix) => ({ index: ix, status: "empty" })),
  };
}

export { makeInitialGameState };
