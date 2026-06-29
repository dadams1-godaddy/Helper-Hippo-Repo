export function helperHippo(app){
app.command('/helperhippo', async ({ ack, say }) => {
  await ack();
  await say('Hello! I am Helper Hippo, your friendly Slack assistant. How can I assist you today?');
  await say({
    text: 'Helper Hippo can help with questions, information, and tasks.',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Here are some things I can help you with:*\n\n• *Answering questions* - Ask me anything!\n• *Providing information* - I can share facts, definitions, and more.\n• *Assisting with tasks* - Need help with a task? Just ask!\n\n*Try asking me something or let me know how I can assist you!*'
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Ask a Question'
          },
          action_id: 'ask_question'
        }
      }
    ]
  });
});
}