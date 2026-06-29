export async function fetchWeather(latitude = 33.4255, longitude = -111.94, locationLabel = 'AZ') {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m&temperature_unit=fahrenheit`
    );
    const data = await response.json();
    const current = data.current;

    return {
      text: `Current weather for ${locationLabel}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🌡️ Current Weather'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `:sunny: Updated for ${locationLabel}`
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Location:*\n${locationLabel}`
            },
            {
              type: 'mrkdwn',
              text: '*Temperature:*\n' + `${current.temperature_2m}°F`
            },
            {
              type: 'mrkdwn',
              text: '*Humidity:*\n' + `${current.relative_humidity_2m}%`
            },
            {
              type: 'mrkdwn',
              text: '*Condition:*\n' + `Code ${current.weather_code}`
            }
          ]
        }
      ]
    };
  } catch (err) {
    return {
      text: 'Unable to fetch weather',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `❌ Unable to fetch weather: ${err.message}`
          }
        }
      ]
    };
  }
}
