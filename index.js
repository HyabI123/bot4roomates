// --- Import required libraries ---
import express from 'express';            // Tiny web server for Render
import dotenv from 'dotenv';              // Loads variables from .env
import { 
  Client,
  GatewayIntentBits
} from 'discord.js';                      // Discord.js to run the bot

// FIXED: import from correct subpath for ESM
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc/index.js';


// --- Load environment variables ---
dotenv.config();

// --- Set up Express web server ---
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

/* Why this matters:
   Render’s free instances require an open port.
   Without this, Render would spin down the bot when idle.
*/


// --- Set up Discord bot ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// Bot ready event
client.on("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online`);
});


// --- In-memory storage ---
let houseShoppingLists = {};      // { guildId: [items] }
let personalShoppingLists = {};   // { userId: [items] }
let weeklyChores = {};            // { guildId: { people, chores, days, time, timezone, channelId } }


// --- Handle interactions ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // Ping command
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  // --- House Shopping: Add items ---
  if (interaction.commandName === 'add-house-shopping') {
    const item = interaction.options.getString("item");
    const newItems = item.split(",").map(i => i.trim().toLowerCase());

    if (!houseShoppingLists[interaction.guild.id]) {
      houseShoppingLists[interaction.guild.id] = [];
    }

    for (const newItem of newItems) {
      if (!houseShoppingLists[interaction.guild.id].includes(newItem)) {
        houseShoppingLists[interaction.guild.id].push(newItem);
      }
    }

    await interaction.reply({
      content: '✅ Added item(s) successfully into house list',
      ephemeral: true
    });
  }

  // --- House Shopping: Display list ---
  if (interaction.commandName === 'house-shopping-list') {
    const list = houseShoppingLists[interaction.guild.id] || [];
    if (list.length === 0) {
      await interaction.reply("🛒 The House Shopping list is empty!");
    } else {
      await interaction.reply("🛒 House Shopping List:\n- " + list.join("\n- "));
    }
  }

  // --- House Shopping: Remove items ---
  if (interaction.commandName === 'remove-house-items') {
    const item = interaction.options.getString("item");
    const newItems = item.split(",").map(i => i.trim().toLowerCase());

    const list = houseShoppingLists[interaction.guild.id] || [];
    const removedItems = [];
    const notFoundItems = [];

    for (const newItem of newItems) {
      const index = list.indexOf(newItem);
      if (index !== -1) {
        list.splice(index, 1);
        removedItems.push(newItem);
      } else {
        notFoundItems.push(newItem);
      }
    }

    houseShoppingLists[interaction.guild.id] = list;

    let replyMessage = "";
    if (removedItems.length > 0) replyMessage += `✅ Removed: ${removedItems.join(", ")}\n`;
    if (notFoundItems.length > 0) replyMessage += `⚠️ Not found: ${notFoundItems.join(", ")}`;
    if (!replyMessage) replyMessage = "No items were provided.";

    await interaction.reply({ content: replyMessage, ephemeral: true });
  }

  // --- Personal Shopping: Add items ---
  if (interaction.commandName === 'add-personal-shopping') {
    const item = interaction.options.getString("item");
    const newItems = item.split(",").map(i => i.trim().toLowerCase());

    if (!personalShoppingLists[interaction.user.id]) {
      personalShoppingLists[interaction.user.id] = [];
    }

    for (const newItem of newItems) {
      if (!personalShoppingLists[interaction.user.id].includes(newItem)) {
        personalShoppingLists[interaction.user.id].push(newItem);
      }
    }

    await interaction.reply({
      content: '✅ Added item(s) successfully into your personal list',
      ephemeral: true
    });
  }

  // --- Personal Shopping: Display list ---
  if (interaction.commandName === 'personal-shopping-list') {
    const list = personalShoppingLists[interaction.user.id] || [];
    if (list.length === 0) {
      await interaction.reply("🛒 The Personal Shopping list is empty!");
    } else {
      await interaction.reply("🛒 Personal Shopping List:\n- " + list.join("\n- "));
    }
  }

  // --- Personal Shopping: Remove items ---
  if (interaction.commandName === 'remove-personal-items') {
    const item = interaction.options.getString("item");
    const newItems = item.split(",").map(i => i.trim().toLowerCase());

    const list = personalShoppingLists[interaction.user.id] || [];
    const removedItems = [];
    const notFoundItems = [];

    for (const newItem of newItems) {
      const index = list.indexOf(newItem);
      if (index !== -1) {
        list.splice(index, 1);
        removedItems.push(newItem);
      } else {
        notFoundItems.push(newItem);
      }
    }

    personalShoppingLists[interaction.user.id] = list;

    let replyMessage = "";
    if (removedItems.length > 0) replyMessage += `✅ Removed: ${removedItems.join(", ")}\n`;
    if (notFoundItems.length > 0) replyMessage += `⚠️ Not found: ${notFoundItems.join(", ")}`;
    if (!replyMessage) replyMessage = "No items were provided.";

    await interaction.reply({ content: replyMessage, ephemeral: true });
  }

  // --- Weekly Chores: Create schedule ---
  if (interaction.commandName === 'create-weekly-chores') {
    const peopleInput = interaction.options.getString("people");
    const choresInput = interaction.options.getString("chores");
    const dayInput = interaction.options.getString("day");
    const timeInput = interaction.options.getString("time");
    const timezoneInput = interaction.options.getString("timezone");
    const channel = interaction.options.getChannel("channel");

    // Split comma-separated inputs
    const people = peopleInput.split(",").map(p => p.trim());
    const chores = choresInput.split(",").map(c => c.trim());

    // Save schedule for this guild
    weeklyChores[interaction.guild.id] = {
      people,
      chores,
      day: dayInput,
      time: timeInput,
      timezone: timezoneInput,
      channelId: channel.id
    };

    // Convert to UTC for storage/debugging
    const utcDate = zonedTimeToUtc(`${dayInput} ${timeInput}`, timezoneInput);

    await interaction.reply({
      content: `✅ Weekly chores created successfully!\nChannel: <#${channel.id}>\nScheduled for: ${utcDate.toUTCString()}`,
      ephemeral: true
    });

    // Example send (later you’d use cron/intervals to actually schedule messages)
    const targetChannel = await client.channels.fetch(channel.id);
    if (targetChannel) {
      targetChannel.send(`🧹 Weekly chores have been scheduled! (${dayInput} at ${timeInput} ${timezoneInput})`);
    }
  }
});


// --- Log into Discord ---
client.login(process.env.DISCORD_TOKEN);