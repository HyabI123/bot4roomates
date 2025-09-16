import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

// --- Define your commands here ---
const commands = [
  // Example command: /ping
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

//Commands for adding to list
    new SlashCommandBuilder()
    .setName("add-house-shopping")
    .setDescription("Add items to a list for your whole house's shopping list!")
    .addStringOption((option) =>
        option
            .setName("item") // lowercase is usually better for option names
            .setDescription("Add items to the house list (comma-separated, ex: milk,bread,apples)")
            .setRequired(true)
    ), 

    new SlashCommandBuilder()
    .setName("add-personal-shopping")
    .setDescription("Add items to a list for your personal shopping list!")
    .addStringOption((option) =>
        option
            .setName("item") // lowercase is usually better for option names
            .setDescription("The item you want to add to your personal shopping list!")
            .setRequired(true)
    ), 

//Commands for displaying lists:
    new SlashCommandBuilder()
    .setName('house-shopping-list')
    .setDescription('Gives you the shopping list for the whole house.'),

  // 👇 When you make new commands, add them here
  // new SlashCommandBuilder()
  //   .setName('yourcommand')
  //   .setDescription('What your command does'),

  
].map(cmd => cmd.toJSON());

// --- Send commands to Discord ---
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