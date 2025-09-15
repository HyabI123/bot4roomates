import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

// --- Define your commands here ---
const commands = [
  // Example command: /ping
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

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