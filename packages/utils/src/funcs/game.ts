export enum GamePlayerKeyPresses {
  NONE = 0,

  LEFT = 1,
  UP = 2,
  DOWN = 3,
  RIGHT = 4,

  LEFT_UP = 5,
  LEFT_DOWN = 6,

  RIGHT_UP = 7,
  RIGHT_DOWN = 8,
}

export type GamePlayerDirectionValues = -1 | 0 | 1;
export type GamePlayerDirections = {
  x: GamePlayerDirectionValues;
  y: GamePlayerDirectionValues;
};
