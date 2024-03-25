import "./style.css";
import { handleDiscordSdk } from "./sdk";

main();

async function main() {
  const sdk = await handleDiscordSdk();
  
  const username = sdk?.member?.nick || sdk?.user.global_name || "Player";
  const roomId = sdk?.instanceId ? sdk.instanceId : "00000000-0000-0000-0000-000000000000";

  console.log(username, roomId);
}
