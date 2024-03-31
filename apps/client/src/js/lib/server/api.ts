import { ServerApiRoom, ServerApiError } from "../../../types";

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

export async function requestRoom(instanceId: string) {
  const response = await fetch(
    `/api/room?instance_id=${encodeURIComponent(instanceId)}`,
  );

  return (await response.json()) as ServerApiRoom & ServerApiError;
}