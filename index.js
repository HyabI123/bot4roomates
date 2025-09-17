//Import required libraries:
import express from 'express';            // Express to create a tiny web server for Render
import dotenv from 'dotenv';              // This library loads variables from the .env file into 
import { Client, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    IntentsBitField,
    GatewayIntentBits } from 'discord.js'; // Discord.js to run the bot

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
    GatewayIntentBits.GuildMembers,    // Lets bot see members in servers
    GatewayIntentBits.MessageContent   // Lets bot access the content of messages
  ]
});

// Checks if bot is alive, if so, display the text
client.on("ready", (c) => {
    console.log(`✅ ${c.user.tag} is online`);
})

// Object to store house shopping lists per server (guild)
let houseShoppingLists = {}; // keys = guild IDs, values = arrays of items
let personalShoppingLists = {}; //same idea but for user's personal shopping list

// Listen for interactions (slash commands, buttons, etc.)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // --- Simple Ping/Pong command ---
    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }

    // --- Command to Add items to house shopping list ---
    if (interaction.commandName === 'add-house-shopping') {
        const item = interaction.options.getString("item");

        // Split on commas, trim whitespace, normalize to lowercase
        const newItems = item.split(",").map(i => i.trim().toLowerCase());

        // Ensure a list exists for this guild
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

    // --- Command to display the house-shopping list ---
    if (interaction.commandName === 'house-shopping-list') {
        const list = houseShoppingLists[interaction.guild.id] || [];
        if (list.length === 0) {
            await interaction.reply("🛒 The House Shopping list is empty!");
        } else {
            await interaction.reply("🛒 House Shopping List:\n- " + list.join("\n- "));
        }
    }

    // --- Command to remove items from house shopping list ---
    if (interaction.commandName === 'remove-house-items') {
        const item = interaction.options.getString("item");

        // Split on commas, trim whitespace, normalize to lowercase
        const newItems = item.split(",").map(i => i.trim().toLowerCase());

        const list = houseShoppingLists[interaction.guild.id] || [];
        const removedItems = [];
        const notFoundItems = [];

        for (const newItem of newItems) {
            const index = list.indexOf(newItem);
            if (index !== -1) {
                list.splice(index, 1); // Remove exactly one item
                removedItems.push(newItem);
            } else {
                notFoundItems.push(newItem);
            }
        }

        // Save updated list back
        houseShoppingLists[interaction.guild.id] = list;

        let replyMessage = "";
        if (removedItems.length > 0) replyMessage += `✅ Removed: ${removedItems.join(", ")}\n`;
        if (notFoundItems.length > 0) replyMessage += `⚠️ Not found: ${notFoundItems.join(", ")}`;
        if (!replyMessage) replyMessage = "No items were provided.";

        await interaction.reply({ content: replyMessage, ephemeral: true });
    }

    // --- Command to Add items to personal shopping list ---
    if (interaction.commandName === 'add-personal-shopping') {
        const item = interaction.options.getString("item");

        // Split on commas, trim whitespace, normalize to lowercase
        const newItems = item.split(",").map(i => i.trim().toLowerCase());

        // Ensure a list exists for this user
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


    // --- Command to display the personal-shopping list ---
    if (interaction.commandName === 'personal-shopping-list') {
        const list = personalShoppingLists[interaction.user.id] || [];
        if (list.length === 0) {
            await interaction.reply("🛒 The Personal Shopping list is empty!");
        } else {
            await interaction.reply("🛒 Personal Shopping List:\n- " + list.join("\n- "));
        }
    }

    // --- Command to remove items from personal shopping list ---
    if (interaction.commandName === 'remove-personal-items') {
        const item = interaction.options.getString("item");

        // Split on commas, trim whitespace, normalize to lowercase
        const newItems = item.split(",").map(i => i.trim().toLowerCase());

        const list = personalShoppingLists[interaction.user.id] || [];
        const removedItems = [];
        const notFoundItems = [];

        for (const newItem of newItems) {
            const index = list.indexOf(newItem);
            if (index !== -1) {
                list.splice(index, 1); // Remove exactly one item
                removedItems.push(newItem);
            } else {
                notFoundItems.push(newItem);
            }
        }

        // Save updated list back
        personalShoppingLists[interaction.user.id] = list;

        let replyMessage = "";
        if (removedItems.length > 0) replyMessage += `✅ Removed: ${removedItems.join(", ")}\n`;
        if (notFoundItems.length > 0) replyMessage += `⚠️ Not found: ${notFoundItems.join(", ")}`;
        if (!replyMessage) replyMessage = "No items were provided.";

        await interaction.reply({ content: replyMessage, ephemeral: true });
    }



    // --- Add other commands here as needed ---
    // if (interaction.commandName === 'yourcommand') {
    //   await interaction.reply('This is my new command!');
    // }
});

// Log into Discord
client.login(process.env.DISCORD_TOKEN); // Use token from .env to connect bot to Discord

// --- How it all works together ---
// 1. Express opens a port → Render sees a web service → instance stays awake.
// 2. Discord.js connects your bot → responds to messages and commands in Discord.
// 3. UptimeRobot pings the Express server → keeps the instance online 24/7.
