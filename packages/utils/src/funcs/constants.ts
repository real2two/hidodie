import { Types } from '@discord/embedded-app-sdk';

/** These are the required scopes to authenticate to the activity */
export const requiredScopes: Types.OAuthScopes[] = [
  'identify',
  // "guilds",
  'guilds.members.read',
  'rpc.activities.write',
];
