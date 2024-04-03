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

const enabledRefreshes =
  import.meta.env.VITE_ENABLE_REFRESHES?.toLowerCase() === "true";

const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get("frame_id") != null;

export enum SessionStorageQueryParam {
  sdkHack = "sdk_hack",
  userId = "user_id",
  guildId = "guild_id",
  channelId = "channel_id",
}

export async function getDiscordSdk() {
  if (isEmbedded) {
    return new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID) as DiscordSDK;
  }
  return createMockDiscordSdk();
}

export async function createMockDiscordSdk() {
  const mockUserId = getOverrideOrRandomSessionValue(
    SessionStorageQueryParam.userId,
  );
  const mockGuildId = getOverrideOrRandomSessionValue(
    SessionStorageQueryParam.guildId,
  );
  const mockChannelId = getOverrideOrRandomSessionValue(
    SessionStorageQueryParam.channelId,
  );

  const discordSdk = new DiscordSDKMock(
    import.meta.env.VITE_DISCORD_CLIENT_ID,
    mockGuildId,
    mockChannelId,
  );
  const discriminator = String(mockUserId.charCodeAt(0) % 5);

  discordSdk._updateCommandMocks({
    authenticate: async () => {
      return {
        access_token: "mock_token",
        user: {
          username: mockUserId,
          discriminator,
          id: mockUserId,
          avatar: null,
          public_flags: 1,
        },
        scopes: [],
        expires: new Date(2112, 1, 1).toString(),
        application: {
          description: "mock_app_description",
          icon: "mock_app_icon",
          id: "mock_app_id",
          name: "mock_app_name",
        },
      };
    },
    userSettingsGetLocale: async () => ({ locale: "en-US" }),
  });

  return discordSdk;
}

export function getOverrideOrRandomSessionValue(
  queryParam: `${SessionStorageQueryParam}`,
) {
  const overrideValue = queryParams.get(queryParam);
  if (overrideValue != null) {
    return overrideValue;
  }

  const currentStoredValue = sessionStorage.getItem(queryParam);
  if (currentStoredValue != null) {
    return currentStoredValue;
  }

  const randomString = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(queryParam, randomString);
  return randomString;
}

export async function handleDiscordAuthentication() {
  const discordSdk = await getDiscordSdk();

  const mock = discordSdk instanceof DiscordSDKMock;
  const close = mock
    ? (code: RPCCloseCodes, message: string) =>
        alert(`Error ${code}: ${message}`)
    : discordSdk.close;

  if (
    // This checks if refreshes are enabled on .env
    enabledRefreshes &&
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
        guild: data.guild as RESTAPIPartialCurrentUserGuild,
        channel: data.channel as Awaited<
          ReturnType<typeof discordSdk.commands.getChannel>
        >,
      };
    }

    discordSdk.close(
      RPCCloseCodes.TOKEN_REVOKED,
      "Could not find refresh data",
    );

    throw new Error("Could not find refresh data");
  }

  try {
    const { gameToken, auth } = await setupDiscordSdk(discordSdk);
    const data = {
      server: {
        token: gameToken,
      },

      user: auth.user,
      locale: (await discordSdk.commands.userSettingsGetLocale()).locale,
      member: await getActivityMember(discordSdk, auth.access_token),
      guild: await getActivityGuild(discordSdk, auth.access_token),
      channel: await getActivityChannel(discordSdk),
    };

    if (
      // This checks if refreshes are enabled on .env
      enabledRefreshes &&
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

  // Retrieve an access_token from your activity's server
  const { game_token, access_token } = isEmbedded
    ? await getAccessToken(code)
    : { game_token: "mock_jwt", access_token: "mock_token" };

  // Authenticate with Discord client (using the access_token)
  const auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (!auth) throw new Error("Authenticate command failed");
  return {
    gameToken: game_token,
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
