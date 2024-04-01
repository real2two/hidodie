import ping from "./transmit/ping";
import chat from "./transmit/chat";
import movement from "./transmit/movement";

// "transmit" for client
// "RECEIVE" for server

import { ServerWebSocketTransmitTypes } from "@/utils";

export default {
  [ServerWebSocketTransmitTypes.Ping]: ping,
  [ServerWebSocketTransmitTypes.SendChatMessage]: chat,
  [ServerWebSocketTransmitTypes.Movement]: movement,
};
