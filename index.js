// Import required libraries
import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import cron from "node-cron";

dotenv.config();

// --- Express server (keeps Render alive) ---
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// --- Discord bot setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online`);
});

// --- Data storage ---
let houseShoppingLists = {};
let personalShoppingLists = {};
let weeklyChores = {}; // store chores configs by guild

// --- Helper validation functions ---
function isValidTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time); // HH:mm 24-hour format
}

function isValidDays(daysArr) {
  const validDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return daysArr.every((d) => validDays.includes(d.toLowerCase()));
}

function isValidTimezone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// --- Interaction handler ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // --- Ping command ---
  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  // --- House shopping list (add) ---
  if (interaction.commandName === "add-house-shopping") {
    const item = interaction.options.getString("item");
    const newItems = item.split(",").map((i) => i.trim().toLowerCase());

    if (!houseShoppingLists[interaction.guild.id]) {
      houseShoppingLists[interaction.guild.id] = [];
    }

    for (const newItem of newItems) {
      if (!houseShoppingLists[interaction.guild.id].includes(newItem)) {
        houseShoppingLists[interaction.guild.id].push(newItem);
      }
    }

    await interaction.reply({
      content: "✅ Added item(s) successfully into house list",
      ephemeral: true,
    });
  }

  // --- House shopping list (display) ---
  if (interaction.commandName === "house-shopping-list") {
    const list = houseShoppingLists[interaction.guild.id] || [];
    if (list.length === 0) {
      await interaction.reply("🛒 The House Shopping list is empty!");
    } else {
      await interaction.reply("🛒 House Shopping List:\n- " + list.join("\n- "));
    }
  }

  // --- Personal shopping list (add) ---
  if (interaction.commandName === "add-personal-shopping") {
    const item = interaction.options.getString("item");
    const newItems = item.split(",").map((i) => i.trim().toLowerCase());

    if (!personalShoppingLists[interaction.user.id]) {
      personalShoppingLists[interaction.user.id] = [];
    }

    for (const newItem of newItems) {
      if (!personalShoppingLists[interaction.user.id].includes(newItem)) {
        personalShoppingLists[interaction.user.id].push(newItem);
      }
    }

    await interaction.reply({
      content: "✅ Added item(s) successfully into your personal list",
      ephemeral: true,
    });
  }

  // --- Personal shopping list (display) ---
  if (interaction.commandName === "personal-shopping-list") {
    const list = personalShoppingLists[interaction.user.id] || [];
    if (list.length === 0) {
      await interaction.reply("🛒 The Personal Shopping list is empty!");
    } else {
      await interaction.reply("🛒 Personal Shopping List:\n- " + list.join("\n- "));
    }
  }

  // --- Weekly chores command ---
  if (interaction.commandName === "create-weekly-chores") {
    const peopleInput = interaction.options.getString("people");
    const choresInput = interaction.options.getString("chores");
    const daysInput = interaction.options.getString("days");
    const timeInput = interaction.options.getString("time");
    const timezoneInput = interaction.options.getString("timezone");
    const channel = interaction.options.getChannel("channel");

    // --- Validation ---
    if (!isValidTime(timeInput)) {
      return await interaction.reply({
        content: "❌ Invalid time format. Use 24-hour format HH:mm (e.g., 14:30).",
        ephemeral: true,
      });
    }

    let days = [];
    if (daysInput.toLowerCase() === "everyday") {
      days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
    } else {
      days = daysInput.split(",").map((d) => d.trim().toLowerCase());
      if (!isValidDays(days)) {
        return await interaction.reply({
          content:
            "❌ Invalid day(s). Use full names (e.g., Monday,Wednesday,Friday) or 'everyday'.",
          ephemeral: true,
        });
      }
    }

    if (!isValidTimezone(timezoneInput)) {
      return await interaction.reply({
        content:
          "❌ Invalid timezone. Use a valid IANA timezone (e.g., America/Los_Angeles, Europe/London).",
        ephemeral: true,
      });
    }

    if (channel.type !== ChannelType.GuildText) {
      return await interaction.reply({
        content: "❌ Please select a text channel for chores reminders.",
        ephemeral: true,
      });
    }

    // --- Save config ---
    const people = peopleInput.split(",").map((p) => p.trim());
    const chores = choresInput.split(",").map((c) => c.trim());

    weeklyChores[interaction.guild.id] = {
      people,
      chores,
      days,
      time: timeInput,
      timezone: timezoneInput,
      channelId: channel.id,
      rotationIndex: 0, // keep track of rotation
    };

    // --- Schedule jobs with node-cron ---
    const [hour, minute] = timeInput.split(":").map(Number);
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    for (const day of days) {
      cron.schedule(`${minute} ${hour} * * ${dayMap[day]}`, async () => {
        const config = weeklyChores[interaction.guild.id];
        if (!config) return;

        const guild = client.guilds.cache.get(interaction.guild.id);
        if (!guild) return;

        const targetChannel = guild.channels.cache.get(config.channelId);
        if (!targetChannel) return;

        // --- Rotation logic ---
        const rotatedPeople = config.people.map(
          (_, i) => config.people[(i + config.rotationIndex) % config.people.length]
        );

        const assignments = config.chores.map(
          (chore, i) => `${rotatedPeople[i % rotatedPeople.length]} → ${chore}`
        );

        targetChannel.send(
          `🧹 Weekly Chores Reminder!\n\n${assignments.join("\n")}`
        );

        // Move rotation forward by 1
        config.rotationIndex = (config.rotationIndex + 1) % config.people.length;
      });
    }

    await interaction.reply({
      content: `✅ Weekly chores with rotation scheduled successfully in #${channel.name}!`,
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
