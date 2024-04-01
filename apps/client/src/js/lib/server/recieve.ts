import ping from "./recieve/ping";
import joined from "./recieve/joined";
import left from "./recieve/left";
import chat from "./recieve/chat";
import movement from "./recieve/movement";

import { ServerWebSocketReceiveTypes } from "@/utils";

export default {
  [ServerWebSocketReceiveTypes.Ping]: ping,
  [ServerWebSocketReceiveTypes.PlayerJoined]: joined,
  [ServerWebSocketReceiveTypes.PlayerLeft]: left,
  [ServerWebSocketReceiveTypes.RecieveChatMessage]: chat,
  [ServerWebSocketReceiveTypes.Movement]: movement,
};
