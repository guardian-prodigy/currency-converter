const cron = require("node-cron");
require("dotenv").config();

const channelId = process.env.REACT_APP_CHANNEL_ID;
const roleId = process.env.REACT_APP_ROLE_ID;
const siteUrl = process.env.REACT_APP_SITE_URL;
const botToken = process.env.BOT_TOKEN;

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
let sendDailyUpdate = true;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  cron.schedule("0 0 * * *", () => {
    if (sendDailyUpdate) {
      sendUpdate();
    }
  });
});

client.on("messageCreate", async (message) => {
  if (message.content === "!currency") {
    sendDailyUpdate = false;
    sendUpdate();
  }
});

async function sendUpdate() {
  try {
    const response = await fetch(siteUrl);
    const dailyUpdate = await response.json();
    const { code, value } = dailyUpdate.data.SRD;
    console.log(value);
    const channel = await client.channels.fetch(channelId);
    channel.send(
      `<@&${roleId}>
Today's currency value is: 1 USD: ${value.toFixed(2)} ${code}`
    );
  } catch (error) {
    console.error(error);
    const channel = await client.channels.fetch(channelId);
    channel.send("An error occurred while fetching the currency data.");
  }
}

client.login(botToken);
