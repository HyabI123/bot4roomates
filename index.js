//Import required libraries:
import express from 'express';            // Express to create a tiny web server for Render
import dotenv from 'dotenv';              // This library loads variables from the .env file into 
import { Client, GatewayIntentBits } from 'discord.js'; // Discord.js to run the bot

//Load environment variables
dotenv.config(); // Reads the .env file and makes the variable: "DISCORD_TOKEN" available

//Set up Express web server
const app = express();            // Create a new Express app
app.get('/', (req, res) => res.send('Bot is running!')); // Responds with the text "Bot is running!" when URL is visited
const PORT = process.env.PORT || 3000;    // Use the PORT from Render, or 3000 locally
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`)); // Start server

/* --- Why the above code matters ---
Renders free instances require an open port to keep the instance “active”.
Without this, Render would automatically spin down the bot when idle.
*/ 

//Set up Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,          // Lets bot see which servers it's in
    GatewayIntentBits.GuildMessages,   // Lets bot read messages in servers
    GatewayIntentBits.MessageContent   // Lets bot access the content of messages
  ]
});

// Bot ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`); // Logs bot name when it’s ready
});


// Log into Discord
client.login(process.env.DISCORD_TOKEN); // Use token from .env to connect bot to Discord

// --- How it all works together ---
// 1. Express opens a port → Render sees a web service → instance stays awake.
// 2. Discord.js connects your bot → responds to messages and commands in Discord.
// 3. UptimeRobot pings the Express server → keeps the instance online 24/7.
