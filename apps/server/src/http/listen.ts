import env from "@/env";
import HyperExpress from "hyper-express";
import jwt from "jsonwebtoken";
import {
  ServerWebSocketTransmitTypes,
  ServerWebSocketReceiveTypes,
} from "@/utils";

import { rooms, type Player, type Room } from "../lib/rooms";
import { recieve, transmit } from "../lib/server";

export const app = new HyperExpress.Server();

app.upgrade("/", (req, res) => {
  const {
    room_id: roomId,
    username,
    user_token: userToken,
  } = req.query_parameters;

  // Check if username is allowed
  if (
    typeof username !== "string" ||
    username.length < 2 ||
    username.length > 32
  ) {
    return res.close();
  }

  // TODO: Check user token
  // jwt.verify()

  // TODO: Validate the room ID and add room to database if it doesn't already exist
  // TODO: Add a way to delete ghost rooms
  const room = rooms.get(roomId);
  if (!room) {
    const newRoom: Room = {
      roomId,
      players: [],
      broadcast: (buffer) => {
        for (const p of newRoom.players) {
          p.send(buffer);
        }
      },
    };
    rooms.set(roomId, newRoom);
  } else if (room.players.length >= 256) {
    return res.close();
  }

  // TODO: Handle user token validation (or some other authorization system for joining)

  res.upgrade({
    username,
    roomId,
  });
});

app.ws(
  "/",
  {
    idle_timeout: 60,
    max_payload_length: 32 * 1024,
    message_type: "ArrayBuffer",
  },
  (ws) => {
    const { roomId, username } = ws.context;

    // Get the room
    const room = rooms.get(roomId);
    if (!room) return ws.close();

    // Define the player's ID
    let playerId = 0;
    while (room.players.find((p) => p.id === playerId)) playerId++;

    // The player object
    const player: Player = {
      id: playerId,
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
        recieve[ServerWebSocketReceiveTypes.PlayerJoined]({
          hidden: true,
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
        hidden: false,
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

        // TODO: This is a WIP placeholder message
        console.log("WebSocket transformed message", transformed);

        // TODO: This is a WIP placeholder handler
        switch (transformed.type) {
          case ServerWebSocketTransmitTypes.Ping:
            ws.send(
              recieve[ServerWebSocketReceiveTypes.Ping]({
                type: ServerWebSocketReceiveTypes.Ping,
              }),
            );
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

    ws.once("close", () => {
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
      if (!room.players.length) rooms.delete(roomId);
    });
  },
);

app.all("*", (req, res) => {
  res.status(404).json({
    error: "not_found",
  });
});

app.listen(env.TestingServerPort);
