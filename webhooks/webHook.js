export async function sendSlackWebhook(payload) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return;
  }

  try {
    const body = typeof payload === 'string' ? JSON.stringify({ text: payload }) : JSON.stringify(payload);

    const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    if (!res.ok) {
      console.error('Slack webhook failed', res.status, await res.text());
    }
  } catch (err) {
    console.error('Error sending Slack webhook', err);
  }
}

export const sendwebhook = sendSlackWebhook;