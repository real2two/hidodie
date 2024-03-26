export default {
  NodeEnv: process.env["NODE_ENV"] as "production" | "development",

  ServerClusters: parseInt(process.env["SERVER_CLUSTERS"]!) ?? 0,
  ServerPort: parseInt(process.env["SERVER_PORT"]!) ?? 3001,

  VitePort: parseInt(process.env["VITE_PORT"]!) ?? 5173,
  ViteProxyTarget: process.env["VITE_PROXY_TARGET"] || "http://localhost:3001",

  DiscordClientId: process.env["VITE_DISCORD_CLIENT_ID"]!,
  DiscordClientSecret: process.env["DISCORD_CLIENT_SECRET"]!,
};
