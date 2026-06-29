import { fetchWeather } from '../utils/fetchWeather.js';

export function weather(app) {
  app.command('/weather', async ({ ack, say, client, command }) => {
    await ack();

    let locationLabel = command.text?.trim();

    if (!locationLabel) {
      try {
        const userInfo = await client.users.info({ user: command.user_id });
        locationLabel = userInfo.user?.tz_label;
      } catch (err) {
        console.error('Could not read Slack user info:', err);
        locationLabel = 'AZ';
      }
    }

    const weather = await fetchWeather(33.4255, -111.94, locationLabel);
    await say(weather);
  });
}