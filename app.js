import 'dotenv/config';
import { App } from '@slack/bolt';

// Initializes app with bot token and app token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

registerCommands(app);

async function main() {
  // Default: start the Bolt app
 await app.start(process.env.PORT || 3000);
 app.logger.info('HelperHippo is running!');
}

main();
#hello