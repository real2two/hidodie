import { RPCCloseCodes } from "@discord/embedded-app-sdk";
import { handleDiscordAuthentication } from "./discord";

export async function handleDiscordSdk() {
  const sdk = await handleDiscordAuthentication();

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

  window.onbeforeunload = () => {
    sdk.close(
      RPCCloseCodes.TOKEN_REVOKED,
      "Refreshed browser",
    );
  }

  return sdk;
}
