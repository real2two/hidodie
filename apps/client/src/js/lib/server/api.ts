import { MatchMakingRoom, MatchMakingError } from "../../../types";

export async function getAccessToken(code: string) {
  const response = await fetch("/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });

  return (await response.json()) as {
    game_token: string;
    access_token: string;
  };
}

export async function requestRoom(
  connectionType: "default" | "discord",
  instanceId: string,
  gameToken: string,
) {
  const response = await fetch(
    `/api/room?` +
      `connection_type=${encodeURIComponent(connectionType)}&` +
      `instance_id=${encodeURIComponent(instanceId)}&` +
      `game_token=${encodeURIComponent(gameToken)}`,
  );

  return (await response.json()) as MatchMakingRoom & MatchMakingError;
}
