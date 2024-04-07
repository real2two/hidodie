import env from "@/env";
import redis from "@/redis";
import jwt from "jsonwebtoken";

export const EXPIREDTOKENS_NAMESPACE = "expired_tokens";
export const expiredTokens = new Map<string, number>();

/**
 * Validates user token
 * @param userToken The user token
 * @param expireIfValid Add token to expire if valid
 * @returns Boolean whether or not the token is valid
 */
export async function getInstanceIdFromUserToken(userToken: string) {
  const redisKey = `${EXPIREDTOKENS_NAMESPACE}:${userToken}`;
  if (await redis.get(redisKey)) return null;

  try {
    const data = jwt.verify(userToken, env.JWTSecret) as {
      instanceId: string;
    };
    return data.instanceId;
  } catch (err) {
    console.error(err);
    return null;
  }
}
