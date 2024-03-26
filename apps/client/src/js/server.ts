export async function requestRoom(instanceId: string) {
  const response = await fetch(
    `/api/room?instance_id=${encodeURIComponent(instanceId)}`,
  );

  const { room } = (await response.json()) as {
    room: {
      id: string;
      server: {
        main: string;
        discord: string;
      };
    };
  };
  return room;
}
