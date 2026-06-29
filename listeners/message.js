// Listens to incoming messages that contain "hello"
export default function registerMessageListeners(app) {
    
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.message('goodbye', async ({ say }) => {
  const responses = ['Adios', 'Au revoir', 'Farewell'];
  const parting = responses[Math.floor(Math.random() * responses.length)];
  await say(`${parting}!`);
});

}
