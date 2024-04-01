import ping from "./recieve/ping";
import joined from "./recieve/joined";
import left from "./recieve/left";
import chat from "./recieve/chat";
import movement from "./recieve/movement";

// "recieve" for client
// "TRANSMIT" for server

import { ServerWebSocketReceiveTypes } from "@/utils";

export default {
  [ServerWebSocketReceiveTypes.Ping]: ping,
  [ServerWebSocketReceiveTypes.PlayerJoined]: joined,
  [ServerWebSocketReceiveTypes.PlayerLeft]: left,
  [ServerWebSocketReceiveTypes.RecieveChatMessage]: chat,
  [ServerWebSocketReceiveTypes.Movement]: movement,
};
