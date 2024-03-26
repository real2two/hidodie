import { redis } from "./redis";

const ROOM_EXPIRES_IN = 60; // in seconds

export async function getCachedRoom(roomId: string) {
  const room = await redis.get(`rooms:${roomId}`);
  if (!room) return null;

  return JSON.parse(room);
}

export function setCachedRoom(roomId: string, data: { hello: "world" }) {
  return redis.set(
    `rooms:${roomId}`,
    JSON.stringify(data),
    "EX",
    ROOM_EXPIRES_IN,
  );
}

export function deleteCachedRoom(roomId: string) {
  return redis.del(`rooms:${roomId}`);
}
