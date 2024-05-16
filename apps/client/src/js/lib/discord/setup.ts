import { RPCCloseCodes } from '@discord/embedded-app-sdk';
import { loadDiscordActivity } from './sdk';
import { isViteProduction } from './mock';

/**
 * Sets up the Discord SDK and returns the data
 * @returns The activity data
 */
export async function setupDiscordSdk() {
  // Loads the Discord activity and gets the activity data
  const activity = await loadDiscordActivity();

  if (isViteProduction || activity.platform === 'mobile') {
    // Close the activity on game updates
    window.onbeforeunload = () => {
      activity.close(RPCCloseCodes.TOKEN_REVOKED, 'Browser refreshed');
    };
    // Disable right clicking
    window.oncontextmenu = () => false;
  }

  // Set activity on user's status
  activity.commands.setActivity({
    activity: {
      timestamps: {
        start: Date.now(),
      },
      assets: {
        large_image: 'icon',
        large_text: 'Hidodie',
        small_image: 'icon',
        small_text: 'Hidodie',
      },
      secrets: {},
    },
  });

  // Return the activity data
  return activity;
}
