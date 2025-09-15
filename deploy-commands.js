import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

// --- Define your commands here ---
const commands = [
  // Example command: /ping
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  // 👇 Add new commands here
  // new SlashCommandBuilder()
  //   .setName('yourcommand')
  //   .setDescription('What your command does'),

].map(cmd => cmd.toJSON());

// --- Send commands to Discord ---
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function main() {
  try {
    console.log('Refreshing commands...');

    // ----- GUILD TEST HERE -----
    // If you want to test commands in a specific server (guild),
    // use Routes.applicationGuildCommands(clientId, guildId)
    // This ensures commands show up instantly in that guild for testing
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    // ---------------------------

    console.log('✅ Successfully registered commands for testing guild!');
  } catch (err) {
    console.error(err);
  }
}

main();
