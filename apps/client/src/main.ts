import rocketLogo from "/rocket.png";
import "./style.css";

import { handleDiscordAuthentication } from "./discord";

document.querySelector("#app")!.innerHTML = `
  <div>
    <img src="${rocketLogo}" class="logo" alt="Discord" />
    <h1>Hello, World!</h1>
  </div>
`;

const sdk = await handleDiscordAuthentication();
const { user, member, guild, channel } = sdk;
appendVoiceChannelName();
appendGuildAvatar();

async function appendVoiceChannelName() {
  const app = document.querySelector("#app")!;

  let activityChannelName = "Unknown";
  if (channel && channel.name) {
    activityChannelName = channel.name;
  }

  const textTagString = `Activity Channel: "${activityChannelName}"`;
  const textTag = document.createElement("p");
  textTag.innerHTML = textTagString;
  app.appendChild(textTag);
}

async function appendGuildAvatar() {
  const app = document.querySelector("#app")!;

  if (guild) {
    const guildImg = document.createElement("img");
    guildImg.setAttribute(
      "src",
      `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`,
    );
    guildImg.setAttribute("width", "128px");
    guildImg.setAttribute("height", "128px");
    guildImg.setAttribute("style", "border-radius: 50%;");
    app.appendChild(guildImg);
  }
}
