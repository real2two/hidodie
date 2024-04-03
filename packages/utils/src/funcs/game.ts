export enum MovementKeyPresses {
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

export type MovementDirections = {
  movingLeft: boolean;
  movingUp: boolean;
  movingDown: boolean;
  movingRight: boolean;
};

export interface Player {
  id: number;
  username: string;
}
