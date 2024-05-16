import { isSnowflake } from './ids';
import type { ActivityInstances } from './types';

/**
 * Validate if a user is in an activity instance
 * @param data The token, activity ID, channel ID, instance ID and user
 * @returns The success state and the guild ID
 */
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
  // Gets alll activity instances
  const data = await getActivityInstances({
    token,
    activityId,
    channelId,
  });

  // Finds the instance with the given instance ID
  const instances = data?.instances || [];
  const instance = instances.find((i) => i.instance_id === instanceId);

  if (!instance) {
    // Failed to find instance
    return {
      success: false,
      guildId: null,
    };
  }

  // Found instance
  // Success state depends on if the user ID is included in the users array
  return {
    success: instance.users.includes(userId),
    guildId: instance.guild_id,
  };
}

/**
 * Get all activity instances on a voice channel
 * @deprecated This endpoint is subject to breaking (ref: Discord Developers https://discord.com/channels/613425648685547541/1222027249826398250/1227003610148114493)
 * @param data The token, activity ID and the channel ID
 * @returns
 */
export async function getActivityInstances({
  token,
  activityId,
  channelId,
}: {
  token: string;
  activityId: string;
  channelId: string;
}): Promise<{ instances: ActivityInstances }> {
  // Checks if the values are valid (this is also here to prevent URL transversing)
  if (!isSnowflake(channelId)) {
    throw new Error('activityId must be a snowflake');
  }
  if (!isSnowflake(channelId)) {
    throw new Error('channelId must be a snowflake');
  }

  // Fetches all activity instances on a voice channel and returns it
  const res = await fetch(
    `https://discord.com/api/activities/${activityId}/instances/${channelId}`,
    {
      method: 'get',
      headers: {
        authorization: `Bot ${token}`,
      },
    },
  );
  return await res.json();
}
