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
  const data = await getActivityInstances({
    token,
    activityId,
    channelId,
  });

  const instances = data?.instances || [];
  const instance = instances.find((i) => i.instance_id === instanceId);

  if (!instance)
    return {
      success: false,
      guildId: null,
    };

  return {
    success: instance.users.includes(userId),
    guildId: instance.guild_id,
  };
}

export async function getActivityInstances({
  token,
  activityId,
  channelId,
}: {
  token: string;
  activityId: string;
  channelId: string;
}): Promise<{ instances: ActivityInstances }> {
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
  return await res.json();
}
