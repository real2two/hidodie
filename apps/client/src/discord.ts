import { DiscordSDK, RPCCloseCodes } from "@discord/embedded-app-sdk";
import {
  RouteBases,
  RESTAPIPartialCurrentUserGuild,
  RESTPatchAPIGuildMemberResult,
} from "discord-api-types/v10";

export async function handleDiscordAuthentication() {
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

  try {
    const auth = await setupDiscordSdk(discordSdk);
    return {
      ...discordSdk,

      user: auth.user,
      member: await getVoiceMember(discordSdk, auth.access_token),
      guild: await getVoiceGuild(discordSdk, auth.access_token),
      channel: await getVoiceChannel(discordSdk),
    };
  } catch (err) {
    console.error(err);

    discordSdk.close(
      RPCCloseCodes.CLOSE_ABNORMAL,
      "Authentication or authorization failure",
    );

    throw new Error("Authentication or authorization failure");
  }
}

async function setupDiscordSdk(discordSdk: DiscordSDK) {
  await discordSdk.ready();

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "guilds",
      "guilds.members.read",
      "rpc.activities.write",
    ],
  });

  // Retrieve an access_token from your activity's server
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  const auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (!auth) throw new Error("Authenticate command failed");
  return auth;
}

export async function getUserGuilds(access_token: string) {
  const response = await fetch(`${RouteBases.api}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
  return (await response.json()) as RESTAPIPartialCurrentUserGuild[];
}

export async function getVoiceGuild(
  discordSdk: DiscordSDK,
  access_token: string,
) {
  if (!discordSdk.guildId) return null;

  const guilds = await getUserGuilds(access_token);
  return guilds.find((g) => g.id === discordSdk.guildId);
}

export async function getVoiceChannel(discordSdk: DiscordSDK) {
  if (!discordSdk.channelId || !discordSdk.guildId) return null;

  return await discordSdk.commands.getChannel({
    channel_id: discordSdk.channelId,
  });
}

export async function getVoiceMember(
  discordSdk: DiscordSDK,
  access_token: string,
) {
  if (!discordSdk.guildId) return null;

  const response = await fetch(
    `${RouteBases.api}/users/@me/guilds/${discordSdk.guildId}/member`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return (await response.json()) as RESTPatchAPIGuildMemberResult;
}
