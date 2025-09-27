// Import required libraries:
import express from 'express';
import dotenv from 'dotenv';
import {
  Client,
  GatewayIntentBits
} from 'discord.js';
import { zonedTimeToUtc } from 'date-fns-tz';

// Load environment variables
dotenv.config();

// Set up Express web server
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// Set up Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online`);
});

// Storage objects
let houseShoppingLists = {};
let personalShoppingLists = {};
let weeklyChores = {};

// Listen for slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // --- Ping command ---
  if (interaction.commandName === 'ping') {
    return interaction.reply('Pong!');
  }

  // --- Add to house shopping list ---
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

    return interaction.reply({
      content: '✅ Added item(s) successfully into house list',
      ephemeral: true
    });
  }

  // --- Show house shopping list ---
  if (interaction.commandName === 'house-shopping-list') {
    const list = houseShoppingLists[interaction.guild.id] || [];
    if (list.length === 0) {
      return interaction.reply("🛒 The House Shopping list is empty!");
    }
    return interaction.reply("🛒 House Shopping List:\n- " + list.join("\n- "));
  }

  // --- Remove from house list ---
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

    return interaction.reply({ content: replyMessage, ephemeral: true });
  }

  // --- Add to personal shopping list ---
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

    return interaction.reply({
      content: '✅ Added item(s) successfully into your personal list',
      ephemeral: true
    });
  }

  // --- Show personal shopping list ---
  if (interaction.commandName === 'personal-shopping-list') {
    const list = personalShoppingLists[interaction.user.id] || [];
    if (list.length === 0) {
      return interaction.reply("🛒 The Personal Shopping list is empty!");
    }
    return interaction.reply("🛒 Personal Shopping List:\n- " + list.join("\n- "));
  }

  // --- Remove from personal list ---
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

    return interaction.reply({ content: replyMessage, ephemeral: true });
  }

  // --- Create weekly chores (with validation) ---
  if (interaction.commandName === 'create-weekly-chores') {
    const peopleInput = interaction.options.getString("people");
    const choresInput = interaction.options.getString("chores");
    const dayInput = interaction.options.getString("day");
    const timeInput = interaction.options.getString("time");
    const timezoneInput = interaction.options.getString("timezone");

    // Validate people
    const people = peopleInput.split(",").map(p => p.trim()).filter(Boolean);
    if (people.length === 0) {
      return interaction.reply({ content: "⚠️ You must provide at least one person.", ephemeral: true });
    }

    // Validate chores
    const chores = choresInput.split(",").map(c => c.trim()).filter(Boolean);
    if (chores.length === 0) {
      return interaction.reply({ content: "⚠️ You must provide at least one chore.", ephemeral: true });
    }

    // Validate days
    const validDays = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday","everyday"];
    const days = dayInput.split(",").map(d => d.trim().toLowerCase());
    if (!days.every(d => validDays.includes(d))) {
      return interaction.reply({
        content: "⚠️ Invalid day(s). Use full names (Monday, Tuesday, …) or 'everyday'.",
        ephemeral: true
      });
    }

    // Validate time
    const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(timeInput)) {
      return interaction.reply({
        content: "⚠️ Invalid time format. Use 24-hour format (HH:MM).",
        ephemeral: true
      });
    }

    // Validate timezone
    let utcDate;
    try {
      utcDate = zonedTimeToUtc(`2024-01-01T${timeInput}:00`, timezoneInput); 
    } catch (err) {
      return interaction.reply({
        content: "⚠️ Invalid timezone. Use a valid IANA timezone (e.g., UTC, PST, EST).",
        ephemeral: true
      });
    }

    // Save chores if valid
    weeklyChores[interaction.guild.id] = {
      people,
      chores,
      days,
      time: timeInput,
      timezone: timezoneInput
    };

    return interaction.reply({
      content: `✅ Weekly chores created!\n👥 People: ${people.join(", ")}\n🧹 Chores: ${chores.join(", ")}\n📅 Days: ${days.join(", ")}\n⏰ Time: ${timeInput} ${timezoneInput}`,
      ephemeral: true
    });
  }
});

// Log into Discord
client.login(process.env.DISCORD_TOKEN);
