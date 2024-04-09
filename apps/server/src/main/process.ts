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

  // For production:

  try {
    // Add the server to the database
    await db.insert(schema.servers).values({
      serverId: env.GameServerId,
      connection: env.GameServerConnection,
      discordUrlMapping: env.GameServerDiscordUrlMapping,
      maxRooms: env.GameServerMaxRooms,
    });
  } catch (err) {
    // If it fails, it errors
    console.error("Failed to open server with ID:", env.GameServerId);
    console.error(err);
    // It sets exiting = true to prevent the default exit actions
    exiting = true;
    return process.exit();
  }

  // Logs that the server was open, which means the database row was created
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
      /*
        // TODO: Add a self-healing solution that automatically removes the game server when it's offline

        Warning: 
        - This method is flawed if the process were to suddenly stop, because the row would still be in the database
        - Since the matchmaking server gets the server with the least "max_rooms", the matchmaking can get stuck telling you to join this game server... even if it's offline
      */
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

// Add the exit events here
process.on("exit", () => exitHandler(true));
process.on("SIGINT", () => exitHandler(true));
process.on("SIGUSR1", () => exitHandler(true));
process.on("SIGUSR2", () => exitHandler(true));
process.on("uncaughtException", () => exitHandler(true));
