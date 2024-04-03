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
import { ChatColors, addChatMessage, clearChat } from "../lib/game";

import { getGameDocs } from "./docs";
import { addGameInputs } from "../lib/game/inputs";

main();

async function main() {
  const data = await handleDiscordSdk();
  setupGame(data);
}

export async function setupGame({
  sdk,
  username,
  room,
  server,
}: Awaited<ReturnType<typeof handleDiscordSdk>>) {
  document.querySelector("#app")!.innerHTML =
    `<canvas id="canvas"></canvas>` +
    `<div id="chat">` +
    `<div id="chat-container"></div>` +
    `<input id="chat-input" maxlength="52">` +
    `</div>` +
    `</div>`;

  const htmlDocs = getGameDocs();

  const players: Player[] = [];
  const opts = await handleRoom({
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
    },
    onMessage: ({ message, reply }) => {
      console.debug("Message recieved", message);

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
            addChatMessage(
              htmlDocs.chatMessages,
              ChatColors.Secondary,
              `${sanitizeHtml(message.username)} joined the server`,
            );
          }
          break;

        case ServerWebSocketReceiveTypes.PlayerLeft:
          addChatMessage(
            htmlDocs.chatMessages,
            ChatColors.Secondary,
            `${sanitizeHtml(players.find((p) => p.id === message.player)?.username!)} left the server`,
          );
          break;

        case ServerWebSocketReceiveTypes.RecieveChatMessage:
          addChatMessage(
            htmlDocs.chatMessages,
            ChatColors.Default,
            `${sanitizeHtml(players.find((p) => p.id === message.player)?.username!)}: ${sanitizeHtml(message.message)}`,
          );
          break;
      }
    },
    onClose: () => {
      console.debug("Disconnected");
      sdk.close(RPCCloseCodes.CLOSE_NORMAL, "Disconnected");
    },
  });

  if (!opts.success) {
    return sdk.close(
      RPCCloseCodes.CLOSE_ABNORMAL,
      "Failed to connect to server",
    );
  }

  clearChat(htmlDocs.chatMessages);
  const { removeInputs } = addGameInputs(htmlDocs, opts);
}
