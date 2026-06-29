# HelperHippo 🦛

A Slack bot built with [Bolt for JavaScript](https://tools.slack.dev/bolt-js/) that provides slash commands, interactive messages, a ticket approval workflow, and live weather updates — all running over Socket Mode (no public URL required).

---

## Features

### Slash Commands

| Command | Description |
|---|---|
| `/helperhippo` | Introduces the bot and shows an interactive "Ask a Question" button |
| `/help` | Lists all available commands and message triggers |
| `/weather [location]` | Shows current temperature, humidity, and conditions. Defaults to your Slack timezone if no location is provided |
| `/joke` | Returns a random joke |
| `/ticket <description>` | Posts a ticket request with Approve / Reject buttons |

### Message Listeners

| Trigger | Response |
|---|---|
| `hello` | Greets the user with a "Click Me" interactive button |
| `goodbye` | Replies with a random farewell (Adios / Au revoir / Farewell) |

### Interactive Actions

- **Click Me** button — acknowledges the button click and announces it to the channel
- **Ask a Question** button — prompts the user to follow up with a question
- **Approve / Reject** on tickets — updates the original ticket message in-place with the reviewer's name and a status badge

### Outgoing Webhook

A `sendSlackWebhook` utility (`webhooks/webHook.js`) lets you post messages to any Slack Incoming Webhook URL from within the app.

---

## Project Structure

```
first-bolt-app/
├── app.js                  # Entry point — initializes the Bolt app and registers all handlers
├── commands/
│   ├── index.js            # Registers all slash commands
│   ├── helperhippo.js      # /helperhippo command
│   ├── help.js             # /help command
│   ├── weather.js          # /weather command
│   ├── joke.js             # /joke command
│   └── ticket.js           # /ticket command + approve/reject actions
├── listeners/
│   ├── message.js          # hello / goodbye message listeners
│   └── actions.js          # button_click, ask_question, approve_ticket, reject_ticket
├── services/
│   └── index.js            # Shared service utilities
├── utils/
│   └── fetchWeather.js     # Fetches weather from the Open-Meteo API
└── webhooks/
    └── webHook.js          # Outgoing Slack Incoming Webhook helper
```

---

## Setup

### 1. Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) and click **Create App**
2. Choose **From an app manifest**
3. Select your workspace and paste in the contents of `manifest.json`
4. Click **Create**, then **Install to Workspace**
5. Under **Basic Info → App-Level Tokens**, click **Generate Token and Scopes** — add both `connections:write` and `authorizations:read` scopes

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```
SLACK_BOT_TOKEN=xoxb-...        # OAuth & Permissions → Bot User OAuth Token
SLACK_APP_TOKEN=xapp-...        # Basic Info → App-Level Tokens
SLACK_WEBHOOK_URL=https://...   # Optional — Incoming Webhook URL for outgoing messages
PORT=3000                        # Optional — defaults to 3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the App

```bash
npm start
```

The bot connects over Socket Mode — no public-facing URL or ngrok tunnel needed.

---

## Dependencies

| Package | Purpose |
|---|---|
| `@slack/bolt` | Slack app framework |
| `dotenv` | Loads `.env` into `process.env` |

Weather data is provided by the [Open-Meteo API](https://open-meteo.com/) — free and no API key required.

---

## License

MIT
