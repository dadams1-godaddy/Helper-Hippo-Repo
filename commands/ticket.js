export function ticket(app) {

app.command('/ticket', async ({ command, ack, say }) => {
  await ack();  

  await say({
    blocks: [
      // 1️⃣ Text at the top
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎫 *New Ticket Request*\n*Submitted by:* <@${command.user_id}>\n*Details:* ${command.text}`
        }
      },
      // 2️⃣ Divider line (optional, looks clean)
      {
        type: 'divider'
      },
      // 3️⃣ Buttons at the bottom
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Approve' },
            style: 'primary', // green button
            action_id: 'approve_ticket'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject' },
            style: 'danger', // red button
            action_id: 'reject_ticket'
          }
        ]
      }
    ],
    text: 'New Ticket Request' // Fallback text for notifications
  });
});
}