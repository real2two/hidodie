import env from "@/env";
import HyperExpress from "hyper-express";
import jwt from "jsonwebtoken";
import { requiredScopes } from "@/utils";
import {
  isSnowflake,
  isUUID,
  validateActivityUserInstance,
} from "../../lib/discord";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

import type {
  RESTGetAPICurrentUserResult,
  RESTPatchAPIGuildMemberResult,
  RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";

export const router = new HyperExpress.Router();

router.post("/", async (req, res) => {
  // Gets the body content
  const {
    code,
    connection_type: connectionType,
    channel_id: channelId,
    instance_id: instanceId,
  } = await req.json();

  // Check if connection type is valid
  if (env.NodeEnv === "production") {
    // If it's production, you should only be able to join through Discord
    if (connectionType !== "discord") {
      return res.status(500).json({
        error: "invalid_connection_type",
        error_description: "connection_type must be 'discord'",
      });
    }
  } else {
    // If it's development, you should be able to join through your browser and Discord
    if (!["default", "discord"].includes(connectionType)) {
      return res.status(500).json({
        error: "invalid_connection_type",
        error_description:
          "connection_type must be either 'default' or 'discord'",
      });
    }
  }

  // Checks if channel_id a valid snowflake
  if (!isSnowflake(channelId)) {
    return res.status(400).json({
      error: "invalid_channel_id",
      error_description: "Invalid channel ID",
    });
  }

  // Checks if instance_id is a valid UUID
  if (!isUUID(instanceId)) {
    return res.status(400).json({
      error: "invalid_instance_id",
      error_description: "Invalid instance ID",
    });
  }

  // Validate and get user data
  let userData: {
    id: string;
    username: string;
    accessToken: string;
  };

  if (env.NodeEnv !== "production" && code === "mock_code") {
    // Create a mock response for browser clients
    // This is for development only, and should never run during production
    const mockIdAndUsername = Math.random().toString(36).slice(2, 10);
    userData = {
      id: mockIdAndUsername,
      username: mockIdAndUsername,
      accessToken: "mock_token",
    };
  } else {
    // Check for OAuth2 to get the user ID
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.DiscordClientId,
        client_secret: env.DiscordClientSecret,
        grant_type: "authorization_code",
        code,
      }),
    });

    const {
      error,
      access_token: accessToken,
      scope,
    } = (await tokenResponse.json()) as RESTPostOAuth2AccessTokenResult & {
      error: string;
    };

    if (!tokenResponse.ok || error) {
      return res.status(403).json({
        error: "authentication_failure",
        error_description: "Authentication or authorization failure",
      });
    }

    // Check if the scopes are valid
    const allScopes = scope.split(" ");
    const missingScopes: string[] = [];

    for (const scope of requiredScopes) {
      if (!allScopes.includes(scope)) {
        missingScopes.push(scope);
      }
    }

    if (missingScopes.length) {
      return res.status(403).json({
        error: "missing_scopes",
        error_description: `Missing scopes: ${missingScopes.join(", ")}`,
        scope: missingScopes,
      });
    }

    // Get user ID and username
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      method: "get",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const {
      id: userId,
      username,
      global_name,
    } = (await userResponse.json()) as RESTGetAPICurrentUserResult;

    // Check if user is in the channel with the given 'channel_id'
    const { success: validChannelAndInstanceId, guildId } =
      await validateActivityUserInstance({
        token: env.DiscordToken,
        activityId: env.DiscordClientId,
        channelId,
        instanceId,
        userId,
      });

    if (!validChannelAndInstanceId) {
      return res.status(403).json({
        error: "invalid_channel_or_instance_id",
        error_message:
          "Failed to validate that you have access to this instance",
      });
    }

    // Get member to get the member's nickname
    const memberResponse = await fetch(
      `https://discord.com/api/users/@me/guilds/${guildId}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { nick } =
      (await memberResponse.json()) as RESTPatchAPIGuildMemberResult;

    // Set user data
    userData = {
      id: userId,
      username: nick || global_name || username,
      accessToken,
    };
  }

  // If there's a room for the following instance, send the connection details
  const room = (
    await db
      .select({
        serverId: schema.servers.serverId,
        connection: schema.servers.connection,
        discordUrlMapping: schema.servers.discordUrlMapping,
      })
      .from(schema.servers)
      .leftJoin(
        schema.rooms,
        eq(schema.servers.serverId, schema.rooms.serverId),
      )
      .where(eq(schema.rooms.roomId, instanceId))
      .limit(1)
  )?.[0];

  // These are 2 values that will be necessary to send connection details to the client
  let gameServerId: string;
  let connection: string;

  if (room) {
    // There's already a room created with the given instance ID
    gameServerId = room.serverId;
    connection =
      connectionType === "default" ? room.connection : room.discordUrlMapping;
  } else {
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
      gameServerId = server.serverId;
      connection =
        connectionType === "default"
          ? server.connection
          : server.discordUrlMapping;
    }
  }

  // Create the user token (JWT), which will be used for validation in the game server
  const userToken = jwt.sign(
    {
      channelId,
      instanceId,
      gameServerId,
      userId: userData.id,
      username: userData.username,
    },
    env.JWTSecret,
    env.NodeEnv === "production"
      ? {
          expiresIn: 60,
        }
      : undefined,
  );

  // Send response
  res.json({
    user_token: userToken,
    access_token: userData.accessToken,
    room: instanceId,
    connection,
  });
});
