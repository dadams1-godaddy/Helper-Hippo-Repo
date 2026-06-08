import 'dotenv/config';
import { App } from '@slack/bolt';
//      _   _ _____ _     ____  _____ ____    _   _ ___ ____  ____   ___  
//     | | | | ____| |   |  _ \| ____|  _ \  | | | |_ _|  _ \|  _ \ / _ \ 
//     | |_| |  _| | |   | |_) |  _| | |_) | | |_| || || |_) | |_) | | | |
//     |  _  | |___| |___|  __/| |___|  _ <  |  _  || ||  __/|  __/| |_| |
//     |_| |_|_____|_____|_|   |_____|_| \_\ |_| |_|___|_|   |_|    \___/ 
//                                                                        

// Initializes app with bot token and app token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

//      /$$$$$$   /$$$$$$  /$$      /$$ /$$      /$$  /$$$$$$  /$$   /$$ /$$$$$$$   /$$$$$$ 
//     /$$__  $$ /$$__  $$| $$$    /$$$| $$$    /$$$ /$$__  $$| $$$ | $$| $$__  $$ /$$__  $$
//    | $$  \__/| $$  \ $$| $$$$  /$$$$| $$$$  /$$$$| $$  \ $$| $$$$| $$| $$  \ $$| $$  \__/
//    | $$      | $$  | $$| $$ $$/$$ $$| $$ $$/$$ $$| $$$$$$$$| $$ $$ $$| $$  | $$|  $$$$$$ 
//    | $$      | $$  | $$| $$  $$$| $$| $$  $$$| $$| $$__  $$| $$  $$$$| $$  | $$ \____  $$
//    | $$    $$| $$  | $$| $$\  $ | $$| $$\  $ | $$| $$  | $$| $$\  $$$| $$  | $$ /$$  \ $$
//    |  $$$$$$/|  $$$$$$/| $$ \/  | $$| $$ \/  | $$| $$  | $$| $$ \  $$| $$$$$$$/|  $$$$$$/
//     \______/  \______/ |__/     |__/|__/     |__/|__/  |__/|__/  \__/|_______/  \______/ 
//commands                                                                                        
app.command('/helperhippo', async ({ ack, say }) => {
  await ack();
  await say('Hello! I am Helper Hippo, your friendly Slack assistant. How can I assist you today?');
  await say ({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Here are some things I can help you with:*\n\n• *Answering questions* - Ask me anything!\n• *Providing information* - I can share facts, definitions, and more.\n• *Assisting with tasks* - Need help with a task? Just ask!\n\n*Try asking me something or let me know how I can assist you!*"
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Ask a Question"
          },
          "action_id": "ask_question"
        }
      }
    ]
  });
});

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

//     /$$       /$$$$$$  /$$$$$$  /$$$$$$$$ /$$$$$$$$ /$$   /$$ /$$$$$$$$ /$$$$$$$   /$$$$$$ 
//    | $$      |_  $$_/ /$$__  $$|__  $$__/| $$_____/| $$$ | $$| $$_____/| $$__  $$ /$$__  $$
//    | $$        | $$  | $$  \__/   | $$   | $$      | $$$$| $$| $$      | $$  \ $$| $$  \__/
//    | $$        | $$  |  $$$$$$    | $$   | $$$$$   | $$ $$ $$| $$$$$   | $$$$$$$/|  $$$$$$ 
//    | $$        | $$   \____  $$   | $$   | $$__/   | $$  $$$$| $$__/   | $$__  $$ \____  $$
//    | $$        | $$   /$$  \ $$   | $$   | $$      | $$\  $$$| $$      | $$  \ $$ /$$  \ $$
//    | $$$$$$$$ /$$$$$$|  $$$$$$/   | $$   | $$$$$$$$| $$ \  $$| $$$$$$$$| $$  | $$|  $$$$$$/
//    |________/|______/ \______/    |__/   |________/|__/  \__/|________/|__/  |__/ \______/ 
//listeners                                                                                
// Listens to incoming messages that contain "hello"
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

// Fetch weather forecast from Open-Meteo (free, no API key needed)
async function fetchWeather(latitude = 33.4255, longitude = -111.9400) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m&temperature_unit=fahrenheit`
    );
    const data = await response.json();
    const current = data.current;
    return `🌡️ **Current Weather** (AZ)\nTemperature: ${current.temperature_2m}°F\nHumidity: ${current.relative_humidity_2m}%`;
  } catch (err) {
    return `❌ Unable to fetch weather: ${err.message}`;
  }
}

// Listens to "I hope it's not hot" and provides weather forecast
app.message('I hope it\'s not hot', async ({ message, say }) => {
  await say('sounds like you need a weather forecast! here is the weather forecast:');
  
  const weatherData = await fetchWeather();
  
  // Send to webhook if available
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await sendSlackWebhook(weatherData);
    } catch (err) {
      console.error('Webhook send failed:', err.message);
    }
  } else {
    // If no webhook, just say the weather in the channel
    await say(weatherData);
  }
});


//      /$$$$$$   /$$$$$$  /$$$$$$$$ /$$$$$$  /$$$$$$  /$$   /$$  /$$$$$$ 
//     /$$__  $$ /$$__  $$|__  $$__/|_  $$_/ /$$__  $$| $$$ | $$ /$$__  $$
//    | $$  \ $$| $$  \__/   | $$     | $$  | $$  \ $$| $$$$| $$| $$  \__/
//    | $$$$$$$$| $$         | $$     | $$  | $$  | $$| $$ $$ $$|  $$$$$$ 
//    | $$__  $$| $$         | $$     | $$  | $$  | $$| $$  $$$$ \____  $$
//    | $$  | $$| $$    $$   | $$     | $$  | $$  | $$| $$\  $$$ /$$  \ $$
//    | $$  | $$|  $$$$$$/   | $$    /$$$$$$|  $$$$$$/| $$ \  $$|  $$$$$$/
//    |__/  |__/ \______/    |__/   |______/ \______/ |__/  \__/ \______/ 
//actions                                                            
app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});
app.action('ask_question', async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}> wants to ask a question! What would you like to know?`);
});

app.action('button_click', async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}> clicked the button!`);
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

app.command('/help', async ({ ack, say }) => {
  await ack();
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*🤖 Available Commands & Features:*\n\n*Messages:*\n• Say `hello` - Get a greeting with a button\n• Say `goodbye` - Get a random farewell message\n\n*Slash Commands:*\n• `/help` - Shows this help message\n\n*Buttons:*\n• Click the \"Click Me\" button in responses to trigger actions"
        }
      }
    ]
  });
});
//     /$$      /$$ /$$$$$$$$ /$$$$$$$  /$$   /$$  /$$$$$$   /$$$$$$  /$$   /$$  /$$$$$$ 
//    | $$  /$ | $$| $$_____/| $$__  $$| $$  | $$ /$$__  $$ /$$__  $$| $$  /$$/ /$$__  $$
//    | $$ /$$$| $$| $$      | $$  \ $$| $$  | $$| $$  \ $$| $$  \ $$| $$ /$$/ | $$  \__/
//    | $$/$$ $$ $$| $$$$$   | $$$$$$$ | $$$$$$$$| $$  | $$| $$  | $$| $$$$$/  |  $$$$$$ 
//    | $$$$_  $$$$| $$__/   | $$__  $$| $$__  $$| $$  | $$| $$  | $$| $$  $$   \____  $$
//    | $$$/ \  $$$| $$      | $$  \ $$| $$  | $$| $$  | $$| $$  | $$| $$\  $$  /$$  \ $$
//    | $$/   \  $$| $$$$$$$$| $$$$$$$/| $$  | $$|  $$$$$$/|  $$$$$$/| $$ \  $$|  $$$$$$/
//    |__/     \__/|________/|_______/ |__/  |__/ \______/  \______/ |__/  \__/ \______/ 
//webhooks               
async function sendSlackWebhook(message, url) {
  const webhookUrl = url || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('No webhook URL provided. Set SLACK_WEBHOOK_URL environment variable or pass --hello-webhook <url> to send a test message.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: message
    })
  });

  if (!response.ok) {
    console.log('Failed to send webhook:', response.status, response.statusText);
  }

  return response.text();
}     


async function main() {
  // CLI mode: send a single "hello" to a webhook and exit
  if (process.argv.includes('--hello-webhook')) {
    const idx = process.argv.indexOf('--hello-webhook');
    const url = process.argv[idx + 1];
    try {
      await sendSlackWebhook('sup from terminal', url);
      console.log('Sent "sup from terminal" to webhook', url || process.env.SLACK_WEBHOOK_URL);
      process.exit(0);
    } catch (err) {
      console.error('Failed to send hello webhook:', err);
      process.exit(1);
    }
  }

  // Default: start the Bolt app
  await app.start(process.env.PORT || 3000);
  app.logger.info('⚡️ Bolt app is running!');
}

main();
