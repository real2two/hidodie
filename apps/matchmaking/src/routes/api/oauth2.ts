import env from "@/env";
import HyperExpress from "hyper-express";
import jwt from "jsonwebtoken";
import { requiredScopes } from "@/utils";
import {
  RESTGetAPICurrentUserResult,
  RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";
import {
  isSnowflake,
  isUUID,
  validateActivityUserInstance,
} from "../../lib/discord";

export const router = new HyperExpress.Router();

router.post("/callback", async (req, res) => {
  const {
    code,
    channel_id: channelId,
    instance_id: instanceId,
  } = await req.json();

  // Check if the snowflakes are valid
  if (!isSnowflake(channelId)) {
    return res.status(400).json({
      error: "invalid_channel_id",
      error_description: "Invalid channel ID",
    });
  }
  if (!isUUID(instanceId)) {
    return res.status(400).json({
      error: "invalid_instance_id",
      error_description: "Invalid instance ID",
    });
  }

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

  const { error, access_token, scope } =
    (await tokenResponse.json()) as RESTPostOAuth2AccessTokenResult & {
      error: string;
    };

  if (!tokenResponse.ok || error) {
    return res.status(403).json({
      error: "authentication_failure",
      error_description: "Authentication or authorization failure",
    });
  }

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

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    method: "get",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { id: userId } =
    (await userResponse.json()) as RESTGetAPICurrentUserResult;

  // Check if user is in the channel with the given 'channel_id'
  const validChannelAndInstanceId = await validateActivityUserInstance({
    token: env.DiscordToken,
    activityId: env.DiscordClientId,
    channelId,
    instanceId,
    userId,
  });

  if (!validChannelAndInstanceId) {
    return res.status(403).json({
      error: "invalid_channel_or_instance_id",
      error_message: "Failed to validate that you have access to this instance",
    });
  }

  // Create the user token (JWT)
  const userToken = jwt.sign(
    { channelId, instanceId, userId },
    env.JWTSecret,
    env.NodeEnv === "production"
      ? {
          expiresIn: 60,
        }
      : undefined,
  );

  res.json({ user_token: userToken, access_token });
});
