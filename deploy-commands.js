// deploy-commands.js
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  // Simple ping
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  // Add house shopping item(s)
  new SlashCommandBuilder()
    .setName("add-house-shopping")
    .setDescription("Add item(s) to the house shopping list (comma separated)")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("Item(s) to add, separated by commas")
        .setRequired(true)
    ),

  // Remove house shopping item(s)
  new SlashCommandBuilder()
  .setName("remove-house-shopping")
  .setDescription("Remove item(s) from the house shopping list (comma separated)")
  .addStringOption((option) =>
    option
      .setName("item")
      .setDescription("Item(s) to remove, separated by commas")
      .setRequired(true)
  ),

  // Display house shopping list
  new SlashCommandBuilder()
    .setName("house-shopping-list")
    .setDescription("View the house shopping list"),

  // Add personal shopping item(s)
  new SlashCommandBuilder()
    .setName("add-personal-shopping")
    .setDescription("Add item(s) to your personal shopping list (comma separated)")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("Item(s) to add, separated by commas")
        .setRequired(true)
    ),

  // Remove personal shopping item(s)
  new SlashCommandBuilder()
  .setName("remove-personal-shopping")
  .setDescription("Remove item(s) from your personal shopping list (comma separated)")
  .addStringOption((option) =>
    option
      .setName("item")
      .setDescription("Item(s) to remove, separated by commas")
      .setRequired(true)
  ),

  // Display personal shopping list
  new SlashCommandBuilder()
    .setName("personal-shopping-list")
    .setDescription("View your personal shopping list"),

  // Create weekly chores schedule
  new SlashCommandBuilder()
    .setName("create-weekly-chores")
    .setDescription("Set up a weekly chores schedule")
    .addStringOption((option) =>
      option
        .setName("people")
        .setDescription("Comma-separated list of people")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("chores")
        .setDescription("Comma-separated list of chores")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("days")
        .setDescription('Comma-separated list of days (e.g. "monday,tuesday") or "everyday"')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("Time in HH:MM (24h) format")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("Timezone (e.g. America/Los_Angeles)")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel where reminders will be posted")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

// Deploy commands using Discord REST API
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🚀 Refreshing application (/) commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
