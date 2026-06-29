const PRIORITY_LABEL = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };
const CATEGORY_LABEL = {
  bug: '🐛 Bug',
  feature: '✨ Feature Request',
  question: '❓ Question',
  maintenance: '🔧 Maintenance',
  other: '📋 Other'
};

export default function registerActionListeners(app) {

  // --- General button actions ---

  app.action('button_click', async ({ body, ack, say }) => {
    await ack();
    await say(`<@${body.user.id}> clicked the button`);
  });

  app.action('ask_question', async ({ body, ack, say }) => {
    await ack();
    await say(`<@${body.user.id}> wants to ask a question! What would you like to know?`);
  });

  // --- Ticket modal submission ---

  app.view('submit_ticket', async ({ ack, body, view, client }) => {
    await ack();

    const channelId = view.private_metadata;
    const userId = body.user.id;
    const values = view.state.values;

    const title = values.title_block.title_input.value;
    const description = values.description_block.description_input.value;
    const priority = values.priority_block.priority_select.selected_option.value;
    const category = values.category_block.category_select.selected_option.value;

    const detailBlocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🎫 New Ticket Request' }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Title:*\n${title}` },
          { type: 'mrkdwn', text: `*Submitted by:*\n<@${userId}>` },
          { type: 'mrkdwn', text: `*Priority:*\n${PRIORITY_LABEL[priority]}` },
          { type: 'mrkdwn', text: `*Category:*\n${CATEGORY_LABEL[category]}` }
        ]
      }
    ];

    if (description) {
      detailBlocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Description:*\n${description}` }
      });
    }

    detailBlocks.push(
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Approve' },
            style: 'primary',
            action_id: 'approve_ticket'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '🔄 In Progress' },
            action_id: 'inprogress_ticket'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject' },
            style: 'danger',
            action_id: 'reject_ticket'
          }
        ]
      }
    );

    await client.chat.postMessage({
      channel: channelId,
      text: `New Ticket: ${title}`,
      blocks: detailBlocks
    });
  });

  // --- Ticket action handlers ---

  app.action('approve_ticket', async ({ body, ack, client }) => {
    await ack();
    const originalBlocks = body.message.blocks.filter(b => b.type !== 'actions');
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      blocks: [
        ...originalBlocks,
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `✅ *Approved* by <@${body.user.id}>` }
        }
      ],
      text: 'Ticket Approved'
    });
  });

  app.action('inprogress_ticket', async ({ body, ack, client }) => {
    await ack();
    const originalBlocks = body.message.blocks.filter(b => b.type !== 'actions');
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      blocks: [
        ...originalBlocks,
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `🔄 *In Progress* — picked up by <@${body.user.id}>` }
        }
      ],
      text: 'Ticket In Progress'
    });
  });

  app.action('reject_ticket', async ({ body, ack, client }) => {
    await ack();
    const originalBlocks = body.message.blocks.filter(b => b.type !== 'actions');
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      blocks: [
        ...originalBlocks,
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `❌ *Rejected* by <@${body.user.id}>` }
        }
      ],
      text: 'Ticket Rejected'
    });
  });

}
