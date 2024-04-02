import "../../css/style.css";

import { RPCCloseCodes } from "@discord/embedded-app-sdk";
import {
  ServerWebSocketReceiveTypes,
  ServerWebSocketTransmitTypes,
} from "@/utils";
import { handleDiscordSdk } from "../lib/discord/setup";
import { handleRoom } from "../lib/server/websocket";

main();

async function main() {
  const { sdk, username, room, server } = await handleDiscordSdk();
  const { success } = await handleRoom({
    connection: room.connection,
    roomId: room.id,
    gameToken: server.token,
    username: username,
    onOpen: ({ reply }) => {
      console.debug("Connected");

      // Ping!
      reply({
        type: ServerWebSocketTransmitTypes.Ping,
      });

      reply({
        type: ServerWebSocketTransmitTypes.SendChatMessage,
        message: "This is a test",
      });
    },
    onMessage: ({ message, reply }) => {
      console.debug("Message recieved", message);

      if (message.type === ServerWebSocketReceiveTypes.RecieveChatMessage) {
        document.querySelector("#app")!.innerHTML +=
          `<p>${message.message} (not sanitized)</p>`;
      }
    },
    onClose: () => {
      console.debug("Disconnected");
    },
  });

  if (!success) {
    return sdk.close(
      RPCCloseCodes.CLOSE_ABNORMAL,
      "Failed to connect to server",
    );
  }

  document.querySelector("#app")!.innerHTML =
    `<p>Username: ${username}</p>` +
    `<p>Room: <code>${JSON.stringify(room)}</code></p>`;
}
