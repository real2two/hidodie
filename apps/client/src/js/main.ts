import "../css/style.css";

import { handleDiscordSdk } from "./sdk";
import { requestRoom } from "./server";

main();

async function main() {
  const sdk = await handleDiscordSdk();

  const username =
    sdk.member?.nick || sdk.user.global_name || sdk.user.username;
  const { locale, guildId, channelId, instanceId } = sdk;

  const room = await requestRoom(instanceId);

  document.querySelector("#app")!.innerHTML =
    `<p>Username: ${username}</p>` +
    `<p>Locale: ${locale}</p>` +
    `<p>Guild ID: ${guildId}</p>` +
    `<p>Channel ID: ${channelId}</p>` +
    `<p>Instance ID: ${instanceId}</p>` +
    `<p>Room: <code>${JSON.stringify(room)}</code></p>`;
}
