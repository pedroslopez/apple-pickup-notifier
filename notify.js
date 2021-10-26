const axios = require('axios').default;

const PUSHOVER_APP_TOKEN = "";
const PUSHOVER_USER_TOKEN = ""

const sendNotification = async ({title, message, url, priority}) => {
  await axios.post(`https://api.pushover.net/1/messages.json`, {
    token: PUSHOVER_APP_TOKEN,
    user: PUSHOVER_USER_TOKEN,
    title,
    message,
    url,
    priority
  })
}

module.exports = {sendNotification};
