import ping from "./transmit/ping";
import chat from "./transmit/chat";
import movement from "./transmit/movement";

// This might sound confusing, but recieve.ts is actually for RECEIVING data to the client on the game server.

import { ServerWebSocketTransmitTypes } from "@/utils";

export default {
  [ServerWebSocketTransmitTypes.Ping]: ping,
  [ServerWebSocketTransmitTypes.SendChatMessage]: chat,
  [ServerWebSocketTransmitTypes.Movement]: movement,
};
