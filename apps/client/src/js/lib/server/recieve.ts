import ping from "./recieve/ping";
import kicked from "./recieve/kicked";
import joined from "./recieve/joined";
import left from "./recieve/left";
import chat from "./recieve/chat";
import movement from "./recieve/movement";

import { ServerWebSocketReceiveTypes } from "@/utils";

export default {
  [ServerWebSocketReceiveTypes.Ping]: ping,
  [ServerWebSocketReceiveTypes.Kicked]: kicked,
  [ServerWebSocketReceiveTypes.PlayerJoined]: joined,
  [ServerWebSocketReceiveTypes.PlayerLeft]: left,
  [ServerWebSocketReceiveTypes.RecieveChatMessage]: chat,
  [ServerWebSocketReceiveTypes.Movement]: movement,
};
