import HyperExpress from "hyper-express";

import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

export const router = new HyperExpress.Router();

router.get("/", async (req, res) => {
  // Get the instance ID
  const { instance_id: instanceId } = req.query_parameters;
  if (typeof instanceId !== "string") {
    return res.status(500).json({
      error: "missing_instance_id",
      error_description: "instance_id must be provided",
    });
  }

  // Instance validation
  // TODO: Add some sort of instance ID validation
  const roomId = instanceId;

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
        connection: room.connection,
        discordUrlMapping: room.discordUrlMapping,
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

    // TODO: Insert a row in the table `rooms` for the new room
    return res.json({
      room: {
        id: roomId,
        connection: server.connection,
        discordUrlMapping: server.discordUrlMapping,
      },
    });
  }
});
