export interface Room {
  roomId: string;
  players: Player[];
  broadcast: (buffer: ArrayBuffer) => void;
}

export interface Player {
  id: number;
  userId: string;
  username: string;
  send: (buffer: ArrayBuffer) => void;
}
