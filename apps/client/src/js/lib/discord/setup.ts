import { RPCCloseCodes } from "@discord/embedded-app-sdk";
import { handleDiscordAuthentication } from "./sdk";
import { isViteProduction } from "./debug";

export async function handleDiscordSdk() {
  const sdk = await handleDiscordAuthentication();

  if (isViteProduction || sdk.platform === "mobile") {
    // Close the activity on game updates
    window.onbeforeunload = () => {
      sdk.close(RPCCloseCodes.TOKEN_REVOKED, "Browser refreshed");
    };
    // Disable right clicking
    window.oncontextmenu = () => false;
  }

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

  // Return the SDK, username and the room
  return {
    sdk,
    room: sdk.room,
  };
}
