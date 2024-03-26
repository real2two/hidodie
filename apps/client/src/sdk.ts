import { handleDiscordAuthentication } from "./discord";

export async function handleDiscordSdk() {
  try {
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

    return sdk;
  } catch (err) {
    console.error(err);
    return null;
  }
}
