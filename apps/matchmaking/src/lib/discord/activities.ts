import { isUUID, isSnowflake } from "./ids";
import type { ActivityInstances } from "./types";

export async function validateActivityUserInstance({
  token,
  activityId,
  channelId,
  instanceId,
  userId,
}: {
  token: string;
  activityId: string;
  channelId: string;
  instanceId: string;
  userId: string;
}) {
  const instances = await getActivityInstances({
    token,
    activityId,
    channelId,
  });
  const instance = instances.find((i) => i.instance_id === instanceId);
  if (!instance) return false;
  return instance.users.includes(userId);
}

export async function getActivityInstances({
  token,
  activityId,
  channelId,
}: {
  token: string;
  activityId: string;
  channelId: string;
}): Promise<ActivityInstances> {
  if (!isSnowflake(channelId)) {
    throw new Error("activityId must be a snowflake");
  }
  if (!isSnowflake(channelId)) {
    throw new Error("channelId must be a snowflake");
  }

  const res = await fetch(
    `https://discord.com/api/activities/${activityId}/instances/${channelId}`,
    {
      method: "get",
      headers: {
        authorization: `Bot ${token}`,
      },
    },
  );
  const data = await res.json();
  return data?.instances || [];
}
