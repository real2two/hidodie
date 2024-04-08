import env from "@/env";
import HyperExpress from "hyper-express";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import {
  ServerWebSocketTransmitTypes,
  ServerWebSocketReceiveTypes,
} from "@/utils";

import { rooms, validateUserToken, type Player, type Room } from "../lib/rooms";
import { recieve, transmit } from "../lib/server";

export const app = new HyperExpress.Server();

app.upgrade("/", async (req, res) => {
  const { user_token: userToken } = req.query_parameters;

  // Check user token
  const { success, data } = await validateUserToken(
    userToken,
    env.NodeEnv === "production",
  );
  if (!success || !data) return res.close();

  // Check server ID
  if (data.gameServerId !== env.GameServerId) return res.close();

  // Send upgrade data
  res.upgrade({
    roomId: data.instanceId,
    userId: data.userId,
    username: data.username,
  });
});

app.ws(
  "/",
  {
    idle_timeout: 60,
    max_payload_length: 32 * 1024,
    message_type: "ArrayBuffer",
  },
  async (ws) => {
    const { roomId, userId, username } = ws.context;

    // Get the room
    let room = rooms.get(roomId);
    if (!room) {
      // Inserts a row in the table `rooms` for the new room
      try {
        await db.insert(schema.rooms).values({
          roomId,
          serverId: env.GameServerId,
        });
      } catch (err) {
        console.error(err);
        ws.send(
          recieve[ServerWebSocketReceiveTypes.Kicked]({
            reason: "Failed to create room. Please try again.",
          }),
        );
        return ws.close();
      }

      // Tries getting the room again
      room = rooms.get(roomId);
      if (!room) {
        // Creates room in memory
        const newRoom: Room = {
          roomId,
          players: [],
          broadcast: (buffer) => {
            for (const p of newRoom.players) {
              p.send(buffer);
            }
          },
        };
        rooms.set(roomId, (room = newRoom));
      }
    } else if (room.players.length >= 25) {
      ws.send(
        recieve[ServerWebSocketReceiveTypes.Kicked]({
          reason: "The room is full",
        }),
      );
      return ws.close();
    }

    // Find if player is already in the server
    if (room.players.find((p) => p.userId === userId)) {
      ws.send(
        recieve[ServerWebSocketReceiveTypes.Kicked]({
          reason: "You're already in the server",
        }),
      );
      return ws.close();
    }

    // Define the player's ID
    let playerId = 0;
    while (room.players.find((p) => p.id === playerId)) playerId++;

    // The player object
    const player: Player = {
      id: playerId,
      userId,
      username,
      send: (buffer) => {
        if (!ws.closed) {
          return ws.send(buffer);
        }
      },
    };

    // Send all current player data to new player
    for (const p of room.players) {
      ws.send(
        recieve[ServerWebSocketReceiveTypes.PlayerAdded]({
          player: p.id,
          username: p.username,
        }),
      );
    }

    // Add player the players list
    room.players.push(player);

    // Send join
    room.broadcast(
      recieve[ServerWebSocketReceiveTypes.PlayerJoined]({
        player: player.id,
        username: player.username,
      }),
    );

    console.log("A player has joined room:", roomId);

    ws.on("message", (buffer: ArrayBuffer, isBinary: boolean) => {
      try {
        if (!isBinary) return;

        const view = new DataView(buffer);
        if (!view.byteLength) return;

        const type = view.getUint8(0) as ServerWebSocketTransmitTypes;
        const transformed = transmit[type]?.(view);

        if (!transformed) return;

        console.log("WebSocket transformed message", transformed);

        switch (transformed.type) {
          case ServerWebSocketTransmitTypes.Ping:
            ws.send(recieve[ServerWebSocketReceiveTypes.Ping]());
            break;
          case ServerWebSocketTransmitTypes.SendChatMessage:
            room.broadcast(
              recieve[ServerWebSocketReceiveTypes.RecieveChatMessage]({
                player: player.id,
                message: transformed.message,
              }),
            );
            break;
        }
      } catch (err) {
        console.error(err);
      }
    });

    ws.once("close", async () => {
      console.log(`A player has disconnected`);

      // Send leave message
      room.broadcast(
        recieve[ServerWebSocketReceiveTypes.PlayerLeft]({
          player: player.id,
        }),
      );

      // Remove player
      room.players.splice(room.players.indexOf(player), 1);

      // Room deletion
      if (!room.players.length) {
        await db.delete(schema.rooms).where(eq(schema.rooms.roomId, roomId));
        rooms.delete(roomId);
      }
    });
  },
);

app.all("*", (req, res) => {
  res.status(404).json({
    error: "not_found",
  });
});

app.listen(env.GameServerPort);
