import type { GamePlayerDirectionValues } from "..";

// Message types
export enum ServerWebSocketReceiveTypes {
  Ping = 0,
  PlayerJoined = 1,
  PlayerLeft = 2,
  RecieveChatMessage = 3,
  Movement = 4,
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

// Player join and left
export interface ServerWebSocketReceivePlayerJoined {
  type: ServerWebSocketReceiveTypes.PlayerJoined;
  player: number;
  hidden: boolean;
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
  direction: {
    x: GamePlayerDirectionValues;
    y: GamePlayerDirectionValues;
  };
  pos: {
    x: number;
    y: number;
  };
}
export interface ServerWebSocketReceiveMovement {
  type: ServerWebSocketReceiveTypes.Movement;
  direction: {
    x: GamePlayerDirectionValues;
    y: GamePlayerDirectionValues;
  };
  pos: {
    x: number;
    y: number;
  };
  player: number;
}