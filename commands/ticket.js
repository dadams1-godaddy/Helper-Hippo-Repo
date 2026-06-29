export function ticket(app) {
  app.command('/ticket', async ({ command, ack, client }) => {
    await ack();

    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'submit_ticket',
        private_metadata: command.channel_id,
        title: { type: 'plain_text', text: 'Submit a Ticket' },
        submit: { type: 'plain_text', text: 'Submit' },
        close: { type: 'plain_text', text: 'Cancel' },
        blocks: [
          {
            type: 'input',
            block_id: 'title_block',
            label: { type: 'plain_text', text: 'Title' },
            element: {
              type: 'plain_text_input',
              action_id: 'title_input',
              placeholder: { type: 'plain_text', text: 'Brief summary of the issue' },
              ...(command.text ? { initial_value: command.text } : {})
            }
          },
          {
            type: 'input',
            block_id: 'description_block',
            label: { type: 'plain_text', text: 'Description' },
            optional: true,
            element: {
              type: 'plain_text_input',
              action_id: 'description_input',
              multiline: true,
              placeholder: { type: 'plain_text', text: 'Provide more detail about the issue...' }
            }
          },
          {
            type: 'input',
            block_id: 'priority_block',
            label: { type: 'plain_text', text: 'Priority' },
            element: {
              type: 'static_select',
              action_id: 'priority_select',
              placeholder: { type: 'plain_text', text: 'Select a priority' },
              options: [
                { text: { type: 'plain_text', text: '🔴 High' }, value: 'high' },
                { text: { type: 'plain_text', text: '🟡 Medium' }, value: 'medium' },
                { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' }
              ]
            }
          },
          {
            type: 'input',
            block_id: 'category_block',
            label: { type: 'plain_text', text: 'Category' },
            element: {
              type: 'static_select',
              action_id: 'category_select',
              placeholder: { type: 'plain_text', text: 'Select a category' },
              options: [
                { text: { type: 'plain_text', text: '🐛 Bug' }, value: 'bug' },
                { text: { type: 'plain_text', text: '✨ Feature Request' }, value: 'feature' },
                { text: { type: 'plain_text', text: '❓ Question' }, value: 'question' },
                { text: { type: 'plain_text', text: '🔧 Maintenance' }, value: 'maintenance' },
                { text: { type: 'plain_text', text: '📋 Other' }, value: 'other' }
              ]
            }
          }
        ]
      }
    });
  });
}
