export type PlayerId = "p1" | "p2";
export interface GameState {
  whoseTurn: PlayerId;
  cells: Cell[];
}

export type CellStatus = "empty" | "X" | "O";
export interface Cell {
  index: number;
  status: CellStatus;
}
