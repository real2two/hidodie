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
  return (await response.json()) as { access_token: string };
}

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
