import env from "@/env";
import HyperExpress from "hyper-express";
import jwt from "jsonwebtoken";
import { requiredScopes } from "@/utils";
import {
  RESTGetAPICurrentUserResult,
  RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";

export const router = new HyperExpress.Router();

router.post("/token", async (req, res) => {
  const body = await req.json();

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.DiscordClientId,
      client_secret: env.DiscordClientSecret,
      grant_type: "authorization_code",
      code: body.code,
    }),
  });

  const { error, error_description, access_token, scope } =
    (await tokenResponse.json()) as RESTPostOAuth2AccessTokenResult & {
      error: string;
      error_description: string;
    };

  if (error) return res.status(403).json({ error, error_description });

  const allScopes = scope.split(" ");
  const missingScopes: string[] = [];
  for (const scope of requiredScopes) {
    if (!allScopes.includes(scope)) {
      missingScopes.push(scope);
    }
  }
  if (missingScopes.length) {
    return res.status(400).json({
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
  const { id } = (await userResponse.json()) as RESTGetAPICurrentUserResult;
  const gameToken = jwt.sign({ id }, env.JWTSecret, { expiresIn: "1m" });

  res.json({ game_token: gameToken, access_token });
});
