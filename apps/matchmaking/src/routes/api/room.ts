import env from "@/env";
import HyperExpress from "hyper-express";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { getInstanceIdFromUserToken } from "../../lib/rooms";

export const router = new HyperExpress.Router();

// TODO: Add rate limiting on this endpoint and the WebSocket

router.get("/", async (req, res) => {
  // Get the instance ID
  const { connection_type: connectionType, user_token: userToken } =
    req.query_parameters as {
      connection_type: "default" | "discord";
      user_token: string;
    };

  if (env.NodeEnv === "production") {
    if (connectionType !== "discord") {
      return res.status(500).json({
        error: "invalid_connection_type",
        error_description: "connection_type must be 'discord'",
      });
    }
  } else {
    if (!["default", "discord"].includes(connectionType)) {
      return res.status(500).json({
        error: "invalid_connection_type",
        error_description:
          "connection_type must be either 'default' or 'discord'",
      });
    }
  }

  if (typeof userToken !== "string") {
    return res.status(500).json({
      error: "missing_user_token",
      error_description: "user_token must be provided",
    });
  }

  // JWT verification
  let roomId = "mock_room_id";
  if (env.NodeEnv === "production" || userToken !== "mock_jwt") {
    const instanceId = await getInstanceIdFromUserToken(userToken);
    if (!instanceId)
      return res.status(403).json({
        error: "invalid_user_token",
        error_description: "The provided user_token was invalid",
      });

    roomId = instanceId;
  }

  // If there's a room for the following instance, send the connection details
  const room = (
    await db
      .select({
        connection: schema.servers.connection,
        discordUrlMapping: schema.servers.discordUrlMapping,
      })
      .from(schema.servers)
      .leftJoin(
        schema.rooms,
        eq(schema.servers.serverId, schema.rooms.serverId),
      )
      .where(eq(schema.rooms.roomId, roomId))
      .limit(1)
  )?.[0];

  if (room) {
    return res.json({
      room: {
        id: roomId,
        connection:
          connectionType === "default"
            ? room.connection
            : room.discordUrlMapping,
      },
    });
  }

  // Create a new room
  const server = (
    (
      await db.execute(
        sql`select ${schema.servers.serverId} as serverId, ${schema.servers.connection} as connection, ${schema.servers.discordUrlMapping} as discordUrlMapping from ${schema.servers} left join ${schema.rooms} on ${schema.servers.serverId}=${schema.rooms.serverId} group by ${schema.servers.serverId} having count(${schema.rooms.serverId}) < max(${schema.servers.maxRooms}) order by count(${schema.servers.serverId}) asc limit 1`,
      )
    )[0] as unknown as {
      serverId: string;
      connection: string;
      discordUrlMapping: string;
    }[]
  )[0];

  if (!server) {
    // There are no game servers available, so create a new game server

    // TODO: Create a game server, instead of responding servers_unavailable
    return res.json({
      error: "servers_unavailable",
      error_description: "No servers are currently available",
    });
  } else {
    // Found an available game server, so create a room on the game server
    // I don't think I should worry if reverse engineers choose their own game servers, since it doesn't really matter.

    return res.json({
      room: {
        id: roomId,
        connection:
          connectionType === "default"
            ? server.connection
            : server.discordUrlMapping,
      },
    });
  }
});
