import "../../css/style.css";

import { RPCCloseCodes } from "@discord/embedded-app-sdk";
import { ServerWebSocketTransmitTypes } from "@/utils";
import { handleDiscordSdk } from "../lib/discord/setup";
import { handleRoom } from "../lib/server/websocket";

main();

async function main() {
  const { sdk, username, room, server } = await handleDiscordSdk();
  const { success } = await handleRoom({
    connection: room.connection,
    roomId: room.id,
    gameToken: server.token,
    onOpen: ({ reply }) => {
      console.debug("Connected");

      // Ping!
      reply({
        type: ServerWebSocketTransmitTypes.Ping,
      });
    },
    onMessage: ({ message, reply }) => {
      console.debug("Message recieved", message);
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
