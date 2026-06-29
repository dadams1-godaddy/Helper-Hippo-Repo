export default function registerActionListeners(app) {
  app.action('button_click', async ({ body, ack, say }) => {
    await ack();
    await say(`<@${body.user.id}> clicked the button`);
  });

  app.action('ask_question', async ({ body, ack, say }) => {
    await ack();
    await say(`<@${body.user.id}> wants to ask a question! What would you like to know?`);
  });
  
// When Approve is clicked
app.action('approve_ticket', async ({ body, ack, client }) => {
  await ack();

  // Update the original message and remove the buttons
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts, // 👈 Timestamp identifies the original message
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎫 *New Ticket Request*\n*Submitted by:* <@${body.message.blocks[0].text.text}>\n*Details:* ${body.message.blocks[0].text.text}`
        }
      },
      {
        type: 'divider'
      },
      // 👇 Replace buttons with a status message
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `✅ *Approved* by <@${body.user.id}>`
        }
      }
    ],
    text: 'Ticket Approved'
  });
});

// When Reject is clicked
app.action('reject_ticket', async ({ body, ack, client }) => {
  await ack();

  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎫 *New Ticket Request*`
        }
      },
      {
        type: 'divider'
      },
      // 👇 Replace buttons with a status message
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *Rejected* by <@${body.user.id}>`
        }
      }
    ],
    text: 'Ticket Rejected'
  });
});

}