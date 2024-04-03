import { DiscordSDKMock } from "@discord/embedded-app-sdk";

export const isViteProduction =
  import.meta.env.VITE_NODE_ENV?.toLowerCase() === "production";

export const queryParams = new URLSearchParams(window.location.search);
export const isEmbedded = queryParams.get("frame_id") != null;

export enum SessionStorageQueryParam {
  sdkHack = "sdk_hack",
  userId = "user_id",
  guildId = "guild_id",
  channelId = "channel_id",
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
