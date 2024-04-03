export interface Room {
  roomId: string;
  players: Player[];
  broadcast: (buffer: ArrayBuffer) => void;
}

export interface Player {
  id: number;
  username: string;
  send: (buffer: ArrayBuffer) => void;
}
