import type { Websocket } from "hyper-express";

export interface Room {
  roomId: string;
  players: Player[];
}

export interface Player {
  id: number;
  username: string;
  send: (buffer: ArrayBuffer) => void;
}
