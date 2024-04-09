import {
  DiscordSDK,
  DiscordSDKMock,
  RPCCloseCodes,
  Platform,
} from "@discord/embedded-app-sdk";
import {
  RouteBases,
  type RESTAPIPartialCurrentUserGuild,
} from "discord-api-types/v10";

import { requiredScopes } from "@/utils";
import { authorizeUser } from "../server/api";

import {
  createMockDiscordSdk,
  isViteProduction,
  isEmbedded,
  SessionStorageQueryParam,
  createMockGuild,
} from "./mock";

/**
 * Get the Discord SDK
 * @returns The DiscordSDK or DiscordSDKMock
 */
export async function getDiscordSdk() {
  if (!isViteProduction && !isEmbedded) return createMockDiscordSdk();
  return new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID) as DiscordSDK;
}

/**
 * Loads the Discord activity and returns any data necessary
 * @returns The activity data
 */
export async function loadDiscordActivity() {
  // Gets the DiscordSDK
  const discordSdk = await getDiscordSdk();

  // Constants that's used everywhere
  const mock = discordSdk instanceof DiscordSDKMock;
  const close = mock
    ? (code: RPCCloseCodes, message: string) =>
        alert(`Error ${code}: ${message}`)
    : discordSdk.close;

  // 'Hacky' solution to handle browser reloads on Discord activities
  // This should never be enabled during production
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
      // If the session storage item is there, send over the data
      const data = JSON.parse(rawData);
      return {
        ...discordSdk,
        mock,
        close,

        room: data.room as {
          id: string;
          connection: string;
          token: string;
        },

        user: data.user as Awaited<
          ReturnType<typeof discordSdk.commands.authenticate>
        >["user"],
        locale: data.locale as string,
        // guild: data.guild as RESTAPIPartialCurrentUserGuild | null,
        // channel: data.channel as Awaited<
        //   ReturnType<typeof discordSdk.commands.getChannel>
        // > | null,
      };
    }

    // Couldn't find session storage information
    discordSdk.close(
      RPCCloseCodes.TOKEN_REVOKED,
      "Could not find refresh data",
    );

    throw new Error("Could not find refresh data");
  }

  try {
    // Sets up the Discord SDK to get the authenication details
    const { auth, room } = await setupDiscordSdk(discordSdk);

    // This is partially the room data
    const data = {
      room,

      user: auth.user,
      locale: (await discordSdk.commands.userSettingsGetLocale()).locale,
      // guild: await getActivityGuild(discordSdk, auth.access_token),
      // channel: await getActivityChannel(discordSdk),
    };

    // Part of the 'hacky' solution to support browser refreshes on Discord activities
    // Again, this should be disabled during production
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

    // Returns data
    return {
      ...discordSdk,
      mock,
      close,

      ...data,
    };
  } catch (err) {
    // There was an error
    console.error(err);

    discordSdk.close(RPCCloseCodes.CLOSE_ABNORMAL, "Error loading activity");

    throw new Error("Error loading activity");
  }
}

/**
 * Sets up the DiscordSDK and fetches anything necessary
 * @param discordSdk The DiscordSDK or DiscordSDKMock
 * @returns Authentication and room data
 */
async function setupDiscordSdk(discordSdk: DiscordSDK | DiscordSDKMock) {
  // Waits for Discord to be ready
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
  const {
    error,
    error_description,
    user_token,
    access_token,
    room,
    connection,
  } = await authorizeUser({
    code,
    connectionType:
      discordSdk instanceof DiscordSDKMock ? "default" : "discord",
    channelId: discordSdk.channelId,
    instanceId: discordSdk.instanceId,
  });

  // Kick out the player if error
  if (error) {
    discordSdk.close(
      RPCCloseCodes.CLOSE_ABNORMAL,
      `Failed to authenticate: ${error_description || error}`,
    );
    throw new Error(`Failed to authenticate: ${error_description || error}`);
  }

  // Authenticate with Discord client (using the access_token)
  const auth = await discordSdk.commands.authenticate({
    access_token,
  });
  if (!auth) throw new Error("Authenticate command failed");

  // Sends over the data
  return {
    auth,
    room: {
      id: room,
      connection,
      token: user_token,
    },
  };
}

/**
 * Get user guilds
 * @param discordSdk The DiscordSDK or DiscordSDKMock
 * @param access_token The access token
 * @returns The guilds
 */
export async function getUserGuilds(
  discordSdk: DiscordSDK | DiscordSDKMock,
  access_token: string,
): Promise<RESTAPIPartialCurrentUserGuild[]> {
  if (!isEmbedded) return createMockGuild(discordSdk.guildId);

  const response = await fetch(`${RouteBases.api}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

/**
 * Gets the user's activity guild
 * @param discordSdk The DiscordSDK or DiscordSDKMock
 * @param access_token The access token
 * @returns The guild
 */
export async function getActivityGuild(
  discordSdk: DiscordSDK | DiscordSDKMock,
  access_token: string,
) {
  if (!discordSdk.guildId) return null;

  const guilds = await getUserGuilds(discordSdk, access_token);
  return guilds.find((g) => g.id === discordSdk.guildId);
}

/**
 * Gets the activity channel
 * @param discordSdk The DiscordSDK or DiscordSDKMock
 * @returns The channel
 */
export async function getActivityChannel(
  discordSdk: DiscordSDK | DiscordSDKMock,
) {
  if (!discordSdk.channelId || !discordSdk.guildId) return null;

  return await discordSdk.commands.getChannel({
    channel_id: discordSdk.channelId,
  });
}
