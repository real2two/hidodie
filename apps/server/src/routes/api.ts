import env from "@/env";
import HyperExpress from "hyper-express";

export const router = new HyperExpress.Router();

router.get("/", (req, res) => {
  res.json({
    hello: "world",
  });
});

router.get("/room", async (req, res) => {
  const { instance_id: instanceId } = req.query_parameters;

  if (typeof instanceId !== "string") {
    return res.status(500).json({ error: "instance_id must be provided" });
  }

  const roomId = instanceId; // TODO: Add some sort of instance ID validation
  const server = {
    // If you're playing on a browser, this is the WebSocket you'd connect to
    main: "localhost:3001",
    // If you're playing through Discord, you must connect through a "URL mapping"
    // https://discord.com/developers/docs/activities/development-guides#url-mapping
    discord: "/api/server",
  };

  res.json({
    room: {
      id: roomId,
      server,
    },
  });
});

router.post("/token", async (req, res) => {
  const body = await req.json();

  const response = await fetch("https://discord.com/api/oauth2/token", {
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

  const { error, error_description, access_token } = await response.json();
  if (!access_token) return res.status(403).json({ error, error_description });

  res.json({ access_token });
});

router.all("/*", (req, res) => {
  res.status(404).json({
    error: "not_found",
  });
});
