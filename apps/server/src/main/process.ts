import env from "@/env";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

let exiting = false;
process.stdin.resume();

startRoom();

async function startRoom() {
  if (env.NodeEnv !== "production") {
    try {
      // Delete all rooms in the game server
      // This runs first, because db.insert is likely to error
      await db
        .delete(schema.rooms)
        .where(eq(schema.rooms.serverId, env.GameServerId));
      // Create room
      // This will probably error while using nodemon
      await db.insert(schema.servers).values({
        serverId: env.GameServerId,
        connection: env.GameServerConnection,
        discordUrlMapping: env.GameServerDiscordUrlMapping,
        maxRooms: env.GameServerMaxRooms,
      });
    } catch (err) {
      // Ignore all errors like a responsible developer
      // Jokes aside, this is so nodemon doesn't spam errors every restart, because the room wasn't deleted
    }
    return;
  }

  try {
    await db.insert(schema.servers).values({
      serverId: env.GameServerId,
      connection: env.GameServerConnection,
      discordUrlMapping: env.GameServerDiscordUrlMapping,
      maxRooms: env.GameServerMaxRooms,
    });
  } catch (err) {
    console.error("Failed to open server with ID:", env.GameServerId);
    console.error(err);

    exiting = true;
    return process.exit();
  }

  console.log("Server opened with ID:", env.GameServerId);
}

async function exitHandler(startExit: boolean) {
  if (startExit) {
    // Check and set exiting state
    if (exiting) return;
    exiting = true;
    console.log("Closing room...");
    // Delete database rows
    try {
      // Delete all rooms on this server
      await db
        .delete(schema.rooms)
        .where(eq(schema.rooms.serverId, env.GameServerId));
      // Delete server
      await db
        .delete(schema.servers)
        .where(eq(schema.servers.serverId, env.GameServerId));
    } catch (err) {
      console.error(err);
    }
    // Close the process
    console.log("Room closed.");
    process.exit();
  }
}

process.on("exit", () => exitHandler(true));
process.on("SIGINT", () => exitHandler(true));
process.on("SIGUSR1", () => exitHandler(true));
process.on("SIGUSR2", () => exitHandler(true));
process.on("uncaughtException", () => exitHandler(true));
