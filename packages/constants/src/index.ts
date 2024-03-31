import { Types } from "@discord/embedded-app-sdk";

export const requiredScopes: Types.OAuthScopes[] = [
  "identify",
  "guilds",
  "guilds.members.read",
  "rpc.activities.write",
];
