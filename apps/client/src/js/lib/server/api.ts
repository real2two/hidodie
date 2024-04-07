import { MatchMakingRoom, MatchMakingError } from "../../../types";

export async function getAccessToken({
  code,
  channelId,
  instanceId,
}: {
  code: string;
  channelId: string;
  instanceId: string;
}) {
  const response = await fetch("/api/oauth2/callback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      channel_id: channelId,
      instance_id: instanceId,
    }),
  });

  return (await response.json()) as {
    user_token: string;
    access_token: string;
  };
}

export async function requestRoom(
  connectionType: "default" | "discord",
  userToken: string,
) {
  const response = await fetch(
    `/api/room?` +
      `connection_type=${encodeURIComponent(connectionType)}&` +
      `user_token=${encodeURIComponent(userToken)}`,
  );

  return (await response.json()) as MatchMakingRoom & MatchMakingError;
}
