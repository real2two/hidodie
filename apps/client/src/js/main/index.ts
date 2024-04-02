import "../../css/style.css";

import { RPCCloseCodes } from "@discord/embedded-app-sdk";
import {
  sanitizeHtml,
  ServerWebSocketReceiveTypes,
  ServerWebSocketTransmitTypes,
  type Player,
} from "@/utils";
import { handleDiscordSdk } from "../lib/discord/setup";
import { handleRoom } from "../lib/server/websocket";

main();

async function main() {
  const { sdk, username, room, server } = await handleDiscordSdk();

  const players: Player[] = [];
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

      const app = document.querySelector("#app")!;
      switch (message.type) {
        case ServerWebSocketReceiveTypes.PlayerJoined:
          // Update player values
          const existingPlayer = players.find((p) => p.id === message.player);
          if (existingPlayer) {
            existingPlayer.username = message.username;
          } else {
            players.push({
              id: message.player,
              username: message.username,
            });
          }

          // Send join message
          if (!message.hidden) {
            app.innerHTML += `<p>${sanitizeHtml(message.username)} joined the server</p>`;
          }
          break;
        case ServerWebSocketReceiveTypes.PlayerLeft:
          app.innerHTML += `<p>${sanitizeHtml(players.find((p) => p.id === message.player)?.username!)} left the server</p>`;
          break;
        case ServerWebSocketReceiveTypes.RecieveChatMessage:
          app.innerHTML += `<p>${sanitizeHtml(players.find((p) => p.id === message.player)?.username!)}: ${sanitizeHtml(message.message)}</p>`;
          break;
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
