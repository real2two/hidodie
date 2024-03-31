import {
  DiscordSDK,
  DiscordSDKMock,
  RPCCloseCodes,
} from "@discord/embedded-app-sdk";
import {
  RouteBases,
  PermissionFlagsBits,
  type RESTAPIPartialCurrentUserGuild,
  type RESTPatchAPIGuildMemberResult,
} from "discord-api-types/v10";

import { requiredScopes } from "@/constants";
import { getAccessToken } from "./server";

const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get("frame_id") != null;

export enum SessionStorageQueryParam {
  userId = "user_id",
  guildId = "guild_id",
  channelId = "channel_id",
}

export async function getDiscordSdk() {
  if (isEmbedded) return new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

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

  try {
    const { gameToken, auth } = await setupDiscordSdk(discordSdk);
    const mock = discordSdk instanceof DiscordSDKMock;
    return {
      ...discordSdk,

      mock,
      game: {
        token: gameToken,
      },

      user: auth.user,
      locale: (await discordSdk.commands.userSettingsGetLocale()).locale,
      member: await getActivityMember(discordSdk, auth.access_token),
      guild: await getActivityGuild(discordSdk, auth.access_token),
      channel: await getActivityChannel(discordSdk),

      close: mock
        ? (code: RPCCloseCodes, message: string) =>
            alert(`Error ${code}: ${message}`)
        : discordSdk.close,
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
