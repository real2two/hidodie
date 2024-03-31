import { RPCCloseCodes } from "@discord/embedded-app-sdk";
import { handleDiscordAuthentication } from "./sdk";
import { requestRoom } from "../server/api";

export async function handleDiscordSdk() {
  const sdk = await handleDiscordAuthentication();

  // Close the activity on game updates
  window.onbeforeunload = () => {
    sdk.close(RPCCloseCodes.TOKEN_REVOKED, "Browser refreshed");
  };

  // Set activity on user's status
  sdk.commands.setActivity({
    activity: {
      timestamps: {
        start: Date.now(),
      },
      assets: {
        large_image: "icon",
        large_text: "Hidodie",
        small_image: "icon",
        small_text: "Hidodie",
      },
      secrets: {},
    },
  });

  // Get username and instance ID of the player
  const username =
    sdk.member?.nick || sdk.user.global_name || sdk.user.username;
  const { instanceId } = sdk;

  // Request a room based off the instance ID
  const room = await requestRoom(sdk.mock ? "default" : "discord", instanceId);
  if (room.error) {
    throw sdk.close(
      RPCCloseCodes.CLOSE_ABNORMAL,
      room.error_description || room.error,
    );
  }

  // Return the sdk, username and the room
  return {
    sdk,
    username,
    room,
  };
}
