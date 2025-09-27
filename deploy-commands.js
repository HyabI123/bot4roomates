import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  new SlashCommandBuilder()
    .setName("add-house-shopping")
    .setDescription("Add items to your whole house's shopping list!")
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("Add item(s) (comma-separated, ex: milk,bread,apples)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("add-personal-shopping")
    .setDescription("Add items to your personal shopping list!")
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("Add item(s) (comma-separated, ex: milk,bread,apples)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('house-shopping-list')
    .setDescription('Displays the shopping list for your whole house.'),

  new SlashCommandBuilder()
    .setName('personal-shopping-list')
    .setDescription('Displays your personal shopping list.'),

  new SlashCommandBuilder()
    .setName('remove-house-items')
    .setDescription('Remove items from the house shopping list.')
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("Items to remove (comma-separated, ex: milk,bread)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('remove-personal-items')
    .setDescription('Remove items from your personal shopping list.')
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("Items to remove (comma-separated, ex: milk,bread)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('create-weekly-chores')
    .setDescription('Create weekly chores for the house!')
    .addStringOption(option =>
      option
        .setName("people")
        .setDescription("Names of people (comma-separated, ex: John,Jane)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("chores")
        .setDescription("Chores (comma-separated, ex: Sweep,Vaccum)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("day")
        .setDescription("Days (ex: Monday or Monday,Wednesday,Friday or Everyday)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("time")
        .setDescription("Time in 24-hour format (ex: 16:00, 05:30)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("timezone")
        .setDescription("Timezone (ex: UTC, PST, EST, Europe/London)")
        .setRequired(true)
    ),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function main() {
  try {
    console.log('Refreshing global commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Successfully registered commands globally!');
  } catch (err) {
    console.error(err);
  }
}

main();
