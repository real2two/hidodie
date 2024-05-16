import ping from './recieve/ping';
import kicked from './recieve/kicked';
import added from './recieve/added';
import joined from './recieve/joined';
import left from './recieve/left';
import chat from './recieve/chat';
import movement from './recieve/movement';

// This might sound confusing, but recieve.ts is actually for SENDING data to the client on the game server.

import { ServerWebSocketReceiveTypes } from '@/utils';

export default {
  [ServerWebSocketReceiveTypes.Ping]: ping,
  [ServerWebSocketReceiveTypes.Kicked]: kicked,
  [ServerWebSocketReceiveTypes.PlayerAdded]: added,
  [ServerWebSocketReceiveTypes.PlayerJoined]: joined,
  [ServerWebSocketReceiveTypes.PlayerLeft]: left,
  [ServerWebSocketReceiveTypes.RecieveChatMessage]: chat,
  [ServerWebSocketReceiveTypes.Movement]: movement,
};
