import 'dotenv/config';
import { App } from '@slack/bolt';
import registerCommands from './commands/index.js';
import registerMessageListeners from './listeners/message.js';
import registerActionListeners from './listeners/actions.js';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

registerCommands(app);
registerMessageListeners(app);
registerActionListeners(app);

async function main() {
  await app.start(process.env.PORT || 3000);
  app.logger.info('HelperHippo is running!');
}

main();


