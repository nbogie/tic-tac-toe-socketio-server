import { collect } from "./collect";
import { GameState, PlayerId } from "./types";
import { Cell } from "./types";

function makeInitialGameState(): GameState {
    return {
        whoseTurn: "p1",
        cells: collect(9, (ix) => ({ index: ix, status: "empty" })),
    };
}

function nextPlayer(current: PlayerId): PlayerId {
    return current === "p1" ? "p2" : "p1";
}

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

export { makeInitialGameState, nextPlayer, setCellAt };
