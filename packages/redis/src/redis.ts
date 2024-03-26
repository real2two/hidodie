import env from "@/env";
import Redis from "ioredis";

export const redis = new Redis({
  port: env.RedisPort,
  host: env.RedisHost,
  username: env.RedisUsername,
  password: env.RedisPassword,
  db: env.RedisDatabase,
  enableOfflineQueue: false,
});

redis.on("error", (err) => {
  console.error(err);
});
