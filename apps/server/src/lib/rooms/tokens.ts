import env from '@/env';
import redis from '@/redis';
import jwt from 'jsonwebtoken';

export const EXPIREDTOKENS_NAMESPACE = 'expired_tokens';
export const expiredTokens = new Map<string, number>();

const cachedExpiredTokens = new Set<string>();

/**
 * Validates user token
 * @param userToken The user token
 * @param expireIfValid Add token to expire if valid
 * @returns Boolean whether or not the token is valid
 */
export async function validateUserToken(
  userToken: string,
  expireIfValid = true,
) {
  // Gets the redis key used for saving expired tokens
  const redisKey = `${EXPIREDTOKENS_NAMESPACE}:${userToken}`;

  try {
    // Check if the token is expired
    if (cachedExpiredTokens.has(redisKey) || (await redis.get(redisKey))) {
      return { success: false };
    }

    // Validate JWT
    const data = jwt.verify(userToken, env.JWTSecret) as {
      channelId: string;
      instanceId: string;
      gameServerId: string;
      userId: string;
      username: string;
      exp: number;
    };

    // Expire JWT
    if (expireIfValid) {
      // Optimal expiration value: data.exp * 1000 (if dates are synced)
      cachedExpiredTokens.add(redisKey);
      try {
        await redis.set(redisKey, data.exp, 'EX', 60000);
      } catch (err2) {
        console.error(err2);
      }
      cachedExpiredTokens.delete(redisKey);
    }

    // Return data
    return { success: true, data };
  } catch (err) {
    // Invalid token
    console.error(err);
    return { success: false };
  }
}
