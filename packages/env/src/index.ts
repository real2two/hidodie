export default {
  NodeEnv: process.env["NODE_ENV"] as "production" | "development",

  MatchmakingServerClusters:
    parseInt(process.env["MATCHMAKINGSERVER_CLUSTERS"]!) || 0,
  MatchmakingServerPort:
    parseInt(process.env["MATCHMAKINGSERVER_PORT"]!) || 3001,

  TestingServerPort: parseInt(process.env["TESTINGSERVER_PORT"]!) || 3002,

  VitePort: parseInt(process.env["VITE_PORT"]!) || 5174,
  ViteProxyTarget: process.env["VITE_PROXY_TARGET"] ?? "http://localhost:3001",

  JWTSecret: process.env["JWT_SECRET"]!,

  DiscordClientId: process.env["VITE_DISCORD_CLIENT_ID"]!,
  DiscordClientSecret: process.env["DISCORD_CLIENT_SECRET"]!,

  DatabaseHost: process.env["DATABASE_HOST"],
  DatabasePort: parseInt(process.env["DATABASE_PORT"]!) ?? 3306,
  DatabaseUser: process.env["DATABASE_USER"],
  DatabasePassword: process.env["DATABASE_PASSWORD"],
  DatabaseName: process.env["DATABASE_NAME"],
};
