import {
  DiscordSDK,
  DiscordSDKMock,
  RPCCloseCodes,
  Platform,
} from "@discord/embedded-app-sdk";
import {
  RouteBases,
  PermissionFlagsBits,
  type APIGuildMember,
  type RESTAPIPartialCurrentUserGuild,
  type RESTPatchAPIGuildMemberResult,
} from "discord-api-types/v10";

import { requiredScopes } from "@/utils";
import { getAccessToken } from "../server/api";

import {
  createMockDiscordSdk,
  isViteProduction,
  isEmbedded,
  SessionStorageQueryParam,
} from "./debug";

export async function getDiscordSdk() {
  if (!isViteProduction && !isEmbedded) return createMockDiscordSdk();
  return new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID) as DiscordSDK;
}

export async function handleDiscordAuthentication() {
  const discordSdk = await getDiscordSdk();

  const mock = discordSdk instanceof DiscordSDKMock;
  const close = mock
    ? (code: RPCCloseCodes, message: string) =>
        alert(`Error ${code}: ${message}`)
    : discordSdk.close;

  if (
    // Refreshes are enabled when vite isn't 'production' on .env
    !isViteProduction &&
    // If this is in a iframe
    isEmbedded &&
    // Checks the platform, because this breaks on mobile
    discordSdk.platform === Platform.DESKTOP &&
    // @ts-ignore Checks if it's NOT the origin
    !discordSdk.sourceOrigin.includes("discord.com")
  ) {
    // This is an instance loading after a browser refresh
    const rawData = sessionStorage.getItem(SessionStorageQueryParam.sdkHack);
    if (rawData) {
      const data = JSON.parse(rawData);
      return {
        ...discordSdk,
        mock,
        close,

        server: {
          token: data.server.token as string,
        },

        user: data.user as Awaited<
          ReturnType<typeof discordSdk.commands.authenticate>
        >["user"],
        locale: data.locale as string,
        member: data.member as APIGuildMember,
        guild: data.guild as RESTAPIPartialCurrentUserGuild | null,
        channel: data.channel as Awaited<
          ReturnType<typeof discordSdk.commands.getChannel>
        > | null,
      };
    }

    discordSdk.close(
      RPCCloseCodes.TOKEN_REVOKED,
      "Could not find refresh data",
    );

    throw new Error("Could not find refresh data");
  }

  try {
    const { userToken, auth } = await setupDiscordSdk(discordSdk);
    const data = {
      server: {
        token: userToken,
      },

      user: auth.user,
      locale: (await discordSdk.commands.userSettingsGetLocale()).locale,
      member: await getActivityMember(discordSdk, auth.access_token),
      guild: await getActivityGuild(discordSdk, auth.access_token),
      channel: await getActivityChannel(discordSdk),
    };

    if (
      // Refreshes are enabled when vite isn't 'production' on .env
      !isViteProduction &&
      // If this is in a iframe
      isEmbedded
    ) {
      sessionStorage.setItem(
        SessionStorageQueryParam.sdkHack,
        JSON.stringify(data),
      );
    }

    return {
      ...discordSdk,
      mock,
      close,

      ...data,
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

async function setupDiscordSdk(discordSdk: DiscordSDK | DiscordSDKMock) {
  await discordSdk.ready();

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: requiredScopes,
  });

  // Check if channelId is defined
  if (!discordSdk.channelId) {
    discordSdk.close(
      RPCCloseCodes.CLOSE_UNSUPPORTED,
      "channelId was not provided in DiscordSDK",
    );
    throw new Error("channelId was not provided in DiscordSDK");
  }

  // Retrieve an access_token from your activity's server
  const { user_token, access_token } = isEmbedded
    ? await getAccessToken({ code, channelId: discordSdk.channelId })
    : { user_token: "mock_jwt", access_token: "mock_token" };

  // Authenticate with Discord client (using the access_token)
  const auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (!auth) throw new Error("Authenticate command failed");
  return {
    userToken: user_token,
    auth,
  };
}

export async function getUserGuilds(
  discordSdk: DiscordSDK | DiscordSDKMock,
  access_token: string,
): Promise<RESTAPIPartialCurrentUserGuild[]> {
  if (isEmbedded) {
    const response = await fetch(`${RouteBases.api}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  }

  // Mock responses
  if (discordSdk.guildId) {
    return [
      {
        id: discordSdk.guildId,
        name: "Mock server",
        icon: null,
        owner: true,
        features: [],
        permissions: String(PermissionFlagsBits.Administrator),
      },
    ];
  }
  return [];
}

export async function getActivityGuild(
  discordSdk: DiscordSDK | DiscordSDKMock,
  access_token: string,
) {
  if (!discordSdk.guildId) return null;

  const guilds = await getUserGuilds(discordSdk, access_token);
  return guilds.find((g) => g.id === discordSdk.guildId);
}

export async function getActivityChannel(
  discordSdk: DiscordSDK | DiscordSDKMock,
) {
  if (!discordSdk.channelId || !discordSdk.guildId) return null;

  return await discordSdk.commands.getChannel({
    channel_id: discordSdk.channelId,
  });
}

export async function getActivityMember(
  discordSdk: DiscordSDK | DiscordSDKMock,
  access_token: string,
): Promise<RESTPatchAPIGuildMemberResult | null> {
  if (!discordSdk.guildId) return null;

  if (isEmbedded) {
    const response = await fetch(
      `${RouteBases.api}/users/@me/guilds/${discordSdk.guildId}/member`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return await response.json();
  }

  return {
    roles: [],
    joined_at: "0",
    deaf: false,
    mute: false,
    flags: 0 << 0,
  };
}
