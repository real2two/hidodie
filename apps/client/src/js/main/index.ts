import "../../css/style.css";

import { RPCCloseCodes } from "@discord/embedded-app-sdk";

import {
  sanitizeHtml,
  ServerWebSocketReceiveTypes,
  ServerWebSocketTransmitTypes,
  type Player,
} from "@/utils";

import { setupDiscordSdk } from "../lib/discord/setup";
import { handleRoom } from "../lib/server/websocket";
import { ChatColors, addChatMessage, clearChat } from "../lib/game";
import { addGameInputs } from "../lib/game/inputs";

import { getGameDocs } from "./docs";
import { setupCanvas } from "./canvas";

main();

async function main() {
  const data = await setupDiscordSdk();
  setupGame(data);
}

export async function setupGame(
  activity: Awaited<ReturnType<typeof setupDiscordSdk>>,
) {
  // Adds the HTML for the game
  document.querySelector("#app")!.innerHTML =
    `<canvas id="canvas" width="1920" height="1080"></canvas>` +
    `<div id="chat">` +
    `<div id="chat-container"></div>` +
    `<input id="chat-input" maxlength="52">` +
    `</div>` +
    `</div>`;

  // Constants
  const htmlDocs = getGameDocs();
  const players: Player[] = [];

  // Joins the room and handles it
  const opts = await handleRoom({
    connection: activity.room.connection,
    userToken: activity.room.token,
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
        case ServerWebSocketReceiveTypes.PlayerAdded:
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
          if (message.type === ServerWebSocketReceiveTypes.PlayerJoined) {
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
            `${sanitizeHtml(
              players.find((p) => p.id === message.player)?.username!,
            )} left the server`,
          );
          break;

        case ServerWebSocketReceiveTypes.RecieveChatMessage:
          addChatMessage(
            htmlDocs.chatMessages,
            ChatColors.Default,
            `${sanitizeHtml(
              players.find((p) => p.id === message.player)?.username!,
            )}: ${sanitizeHtml(message.message)}`,
          );
          break;

        case ServerWebSocketReceiveTypes.Kicked:
          activity.close(
            RPCCloseCodes.CLOSE_ABNORMAL,
            `You have been kicked from the server: ${
              message.reason || "No reason provided"
            }`,
          );
          break;
      }
    },
    onClose: () => {
      console.debug("Disconnected");
      activity.close(RPCCloseCodes.CLOSE_ABNORMAL, "Disconnected");
    },
  });

  // If player failed to join, close the activity
  if (!opts.success) {
    return activity.close(
      RPCCloseCodes.CLOSE_ABNORMAL,
      "Failed to connect to server",
    );
  }

  // Handle canvas
  setupCanvas(htmlDocs);

  // Runs other necessary functions
  clearChat(htmlDocs.chatMessages);
  addGameInputs(htmlDocs, opts);
}
