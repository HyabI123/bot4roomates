import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [

  // --- Ping ---
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  // --- House Shopping ---
  new SlashCommandBuilder()
    .setName('add-house-shopping')
    .setDescription('Add item(s) to the house shopping list (comma separated)')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Item(s) to add (comma separated)')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('house-shopping-list')
    .setDescription('Show the current house shopping list'),

  new SlashCommandBuilder()
    .setName('remove-house-items')
    .setDescription('Remove item(s) from the house shopping list')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Item(s) to remove (comma separated)')
        .setRequired(true)
    ),

  // --- Personal Shopping ---
  new SlashCommandBuilder()
    .setName('add-personal-shopping')
    .setDescription('Add item(s) to your personal shopping list (comma separated)')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Item(s) to add (comma separated)')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('personal-shopping-list')
    .setDescription('Show your personal shopping list'),

  new SlashCommandBuilder()
    .setName('remove-personal-items')
    .setDescription('Remove item(s) from your personal shopping list')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Item(s) to remove (comma separated)')
        .setRequired(true)
    ),

  // --- Weekly Chores ---
  new SlashCommandBuilder()
    .setName('create-weekly-chores')
    .setDescription('Create a weekly (or daily) chore schedule')
    .addStringOption(option =>
      option.setName('people')
        .setDescription('Comma-separated list of people')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('chores')
        .setDescription('Comma-separated list of chores')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('day')
        .setDescription('Day(s) of the week (e.g. Monday, Mon, Mon,Wed,Fri, or Every day)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time in 24-hour format (e.g. 09:00, 14:30, 23:45)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('timezone')
        .setDescription('Timezone (e.g. America/Los_Angeles, UTC, Europe/London)')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel where the chores message will be sent')
        .setRequired(true)
    ),
];

// --- Deploy the commands ---
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🚀 Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
