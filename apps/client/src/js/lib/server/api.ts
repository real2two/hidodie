import { MatchMakingRoom, MatchMakingError } from "../../../types";

export async function getAccessToken({
  code,
  channelId,
}: {
  code: string;
  channelId: string;
}) {
  const response = await fetch("/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      channel_id: channelId,
    }),
  });

  return (await response.json()) as {
    user_token: string;
    access_token: string;
  };
}

export async function requestRoom(
  connectionType: "default" | "discord",
  instanceId: string,
  userToken: string,
) {
  const response = await fetch(
    `/api/room?` +
      `connection_type=${encodeURIComponent(connectionType)}&` +
      `instance_id=${encodeURIComponent(instanceId)}&` +
      `user_token=${encodeURIComponent(userToken)}`,
  );

  return (await response.json()) as MatchMakingRoom & MatchMakingError;
}
