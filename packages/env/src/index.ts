export default {
  NodeEnv: process.env["NODE_ENV"] as "production" | "development",

  MatchmakingServerClusters:
    parseInt(process.env["MATCHMAKINGSERVER_CLUSTERS"]!) || 0,
  MatchmakingServerPort:
    parseInt(process.env["MATCHMAKINGSERVER_PORT"]!) || 3001,

  GameServerId: process.env["GAMESERVER_ID"]! || "local",
  GameServerPort: parseInt(process.env["GAMESERVER_PORT"]!) || 3002,
  GameServerConnection:
    process.env["GAMESERVER_CONNECTION"]! || "localhost:3002",
  GameServerDiscordUrlMapping:
    process.env["GAMESERVER_DISCORDURLMAPPING"]! || "/api/server/local",
  GameServerMaxRooms: parseInt(process.env["GAMESERVER_MAXROOMS"]!) || 100,

  VitePort: parseInt(process.env["VITE_PORT"]!) || 5173,
  ViteProxyTarget: process.env["VITE_PROXY_TARGET"] ?? "http://localhost:3001",

  JWTSecret: process.env["JWT_SECRET"]!,

  DiscordClientId: process.env["VITE_DISCORD_CLIENT_ID"]!,
  DiscordClientSecret: process.env["DISCORD_CLIENT_SECRET"]!,
  DiscordToken: process.env["DISCORD_TOKEN"]!,

  DatabaseHost: process.env["DATABASE_HOST"],
  DatabasePort: parseInt(process.env["DATABASE_PORT"]!) ?? 3306,
  DatabaseUser: process.env["DATABASE_USER"],
  DatabasePassword: process.env["DATABASE_PASSWORD"],
  DatabaseName: process.env["DATABASE_NAME"],

  RedisPort: parseInt(process.env["REDIS_PORT"]!) || 6379,
  RedisHost: process.env["REDIS_HOST"] ?? "127.0.0.1",
  RedisUsername: process.env["REDIS_USERNAME"],
  RedisPassword: process.env["REDIS_PASSWORD"],
  RedisDatabase: parseInt(process.env["REDIS_DB"]!) || 0,
};
