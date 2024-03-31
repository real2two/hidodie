import "../../css/style.css";

import { handleDiscordSdk } from "../lib/discord/setup";

main();

async function main() {
  const { username, room } = await handleDiscordSdk();

  document.querySelector("#app")!.innerHTML =
    `<p>Username: ${username}</p>` +
    `<p>Room: <code>${JSON.stringify(room)}</code></p>`;
}
