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

export type MovementDirectionValues = -1 | 0 | 1;
export type MovementDirections = {
  x: MovementDirectionValues;
  y: MovementDirectionValues;
};

export interface Player {
  id: number;
  username: string;
}
