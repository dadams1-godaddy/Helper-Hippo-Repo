export function help(app){
app.command('/help', async ({ ack, say }) => {
  await ack();
  await say({
    text: 'Here are the available commands and features.',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🤖 Available Commands & Features:*\n\n*Messages:*\n• Say `hello` - Get a greeting with a button\n• Say `goodbye` - Get a random farewell message\n\n*Slash Commands:*\n• `/help` - Shows this help message\n\n*Buttons:*\n• Click the "Click Me" button in responses to trigger actions'
        }
      }
    ]
  });
});

}