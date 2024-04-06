import type { MovementDirections } from "..";

// Message types
export enum ServerWebSocketReceiveTypes {
  Ping = 0,
  Kicked = 1,
  PlayerAdded = 2,
  PlayerJoined = 3,
  PlayerLeft = 4,
  RecieveChatMessage = 5,
  Movement = 6,
}
export enum ServerWebSocketTransmitTypes {
  Ping = 0,
  SendChatMessage = 1,
  Movement = 2,
}

// Base types
export type ServerWebSocketTransmit =
  | ServerWebSocketTransmitPing
  | ServerWebSocketTransmitSendChatMessage
  | ServerWebSocketTransmitMovement;
export type ServerWebSocketReceive =
  | ServerWebSocketReceivePing
  | ServerWebSocketReceiveKicked
  | ServerWebSocketReceivePlayerAdded
  | ServerWebSocketReceivePlayerJoined
  | ServerWebSocketReceivePlayerLeft
  | ServerWebSocketReceiveSendChatMessage
  | ServerWebSocketReceiveMovement;

// Ping
export interface ServerWebSocketTransmitPing {
  type: ServerWebSocketTransmitTypes.Ping;
}
export interface ServerWebSocketReceivePing {
  type: ServerWebSocketReceiveTypes.Ping;
}

// Kicked
export interface ServerWebSocketReceiveKicked {
  type: ServerWebSocketReceiveTypes.Kicked;
  reason: string;
}

// Player join and left
export interface ServerWebSocketReceivePlayerAdded {
  type: ServerWebSocketReceiveTypes.PlayerAdded;
  player: number;
  username: string;
}
export interface ServerWebSocketReceivePlayerJoined {
  type: ServerWebSocketReceiveTypes.PlayerJoined;
  player: number;
  username: string;
}
export interface ServerWebSocketReceivePlayerLeft {
  type: ServerWebSocketReceiveTypes.PlayerLeft;
  player: number;
}

// Chat messages
export interface ServerWebSocketTransmitSendChatMessage {
  type: ServerWebSocketTransmitTypes.SendChatMessage;
  message: string;
}
export interface ServerWebSocketReceiveSendChatMessage {
  type: ServerWebSocketReceiveTypes.RecieveChatMessage;
  player: number;
  message: string;
}

// Movement
export interface ServerWebSocketTransmitMovement {
  type: ServerWebSocketTransmitTypes.Movement;
  direction: MovementDirections;
  pos: {
    x: number;
    y: number;
  };
}
export interface ServerWebSocketReceiveMovement {
  type: ServerWebSocketReceiveTypes.Movement;
  direction: MovementDirections;
  pos: {
    x: number;
    y: number;
  };
  player: number;
}
