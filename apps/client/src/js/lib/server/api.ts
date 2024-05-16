export async function authorizeUser({
  code,
  connectionType,
  channelId,
  instanceId,
}: {
  code: string;
  connectionType: 'default' | 'discord';
  channelId: string;
  instanceId: string;
}) {
  const response = await fetch('/api/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      connection_type: connectionType,
      channel_id: channelId,
      instance_id: instanceId,
    }),
  });

  return (await response.json()) as {
    error?: string;
    error_description?: string;
    user_token: string;
    access_token: string;
    room: string;
    connection: string;
  };
}
