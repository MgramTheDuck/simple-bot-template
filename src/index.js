/**
 * @fileoverview Discord bot main entry point - handles initialization, command loading, and event management
 * @version 1.0.0
 */

const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits, MessageFlags} = require('discord.js');
const dotenv = require('dotenv');
const {deployCommands} = require('./deploy.js');

console.log({
    type: 'INFO',
    message: 'Booting up the bot...',
    timestamp: new Date().toISOString()
})

dotenv.config()

/**
 * Environment variable validation
 * Checks if the necessary environment variables are set for bot operation
 */
if (!process.env.BOTTOKEN) {
    console.error({
        type: 'ERROR',
        code: 'MISSING_BOTTOKEN',
        message: 'BOTTOKEN environment variable is not set. Please set it in your .env file. Learn more about how to get your bot token: https://discordjs.guide/preparations/setting-up-a-bot-application.html',
        timestamp: new Date().toISOString()
    });
    process.exit(1);
}

/**
 * Discord bot client instance
 * @type {Client}
 */
const bot = new Client({intents: [GatewayIntentBits.Guilds]});

/**
 * Command collection for storing bot commands
 * @type {Collection}
 */
bot.commands = new Collection();

/**
 * Path to the commands folder
 * @type {string}
 */
const foldersPath = path.join(__dirname, 'commands');

/**
 * Array of command folder names
 * @type {string[]}
 */
const commandFolders = fs.readdirSync(foldersPath).filter(item => {
    const itemPath = path.join(foldersPath, item);
    return fs.statSync(itemPath).isDirectory();
});

/**
 * Main async function to initialize the Discord bot
 * Handles command deployment, command loading, event listeners, and bot login
 * @async
 * @function
 * @returns {Promise<void>}
 */
(async () => {
    try {
        /**
         * Deploy commands to Discord API
         * Ensures any command changes are applied before bot starts
         */
        console.log({type: 'INFO', message: 'Deploying commands...', timestamp: new Date().toISOString()});
        await deployCommands();
        console.log({type: 'INFO', message: 'Command deploy complete', timestamp: new Date().toISOString()});

        /**
         * Load commands from the root of the commands directory
         * Processes .js files directly in the commands folder
         */
        const rootCommandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
        for (const file of rootCommandFiles) {
            const filePath = path.join(foldersPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                try {
                    // Handle both async functions and regular SlashCommandBuilder objects
                    if (typeof command.data === 'function') {
                        const commandData = await command.data();
                        command.resolvedData = commandData;
                        bot.commands.set(commandData.name, command);
                    } else {
                        bot.commands.set(command.data.name, command);
                    }
                } catch (error) {
                    console.error({
                        type: 'ERROR',
                        code: 'COMMAND_LOAD_ERROR',
                        message: `Error loading command from ${filePath}`,
                        error: error.message,
                        stack: error.stack,
                        filePath,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                console.error({
                    type: 'ERROR',
                    code: 'COMMAND_MISSING_PROPERTIES',
                    message: `The command at ${filePath} is missing a required "data" or "execute" property.`,
                    filePath,
                    timestamp: new Date().toISOString()
                });
            }
        }

        /**
         * Load commands from subdirectories in the commands directory
         * Iterates through command folders and files to register commands
         */
        for (const folder of commandFolders) {
            // Skip the tooling directory as it contains utility modules, not commands
            if (folder === 'tooling') continue;

            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ('data' in command && 'execute' in command) {
                    try {
                        // Handle both async functions and regular SlashCommandBuilder objects
                        if (typeof command.data === 'function') {
                            const commandData = await command.data();
                            command.resolvedData = commandData;
                            bot.commands.set(commandData.name, command);
                        } else {
                            bot.commands.set(command.data.name, command);
                        }
                    } catch (error) {
                        console.error({
                            type: 'ERROR',
                            code: 'COMMAND_LOAD_ERROR',
                            message: `Error loading command from ${filePath}`,
                            error: error.message,
                            stack: error.stack,
                            filePath,
                            timestamp: new Date().toISOString()
                        });
                    }
                } else {
                    console.error({
                        type: 'ERROR',
                        code: 'COMMAND_MISSING_PROPERTIES',
                        message: `The command at ${filePath} is missing a required "data" or "execute" property.`,
                        filePath,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        /**
         * Event listener for when the bot is ready
         * @param {Client} readyClient - The ready Discord client instance
         */
        bot.on(Events.ClientReady, readyClient => {
            console.log({
                type: 'INFO',
                message: `Logged in as ${readyClient.user.tag}!`,
                username: readyClient.user.username,
                id: readyClient.user.id,
                timestamp: new Date().toISOString()
            });
        });

        /**
         * Event listener for interaction events (slash commands)
         * Handles command execution and error management
         * @param {import('discord.js').ChatInputCommandInteraction} interaction - The Discord interaction object
         */
        bot.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error({
                    type: 'ERROR',
                    code: 'COMMAND_NOT_FOUND',
                    message: 'No command matching ' + interaction.commandName + ' was found.',
                    commandName: interaction.commandName,
                    options: interaction.options.data,
                    guildId: interaction.guildId,
                    userId: interaction.user.id,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            try {
                await command.execute(interaction);
                // Log successful command execution
                console.log({
                    type: 'INFO',
                    message: 'Command executed successfully',
                    commandName: interaction.commandName,
                    options: interaction.options.data,
                    guildId: interaction.guildId,
                    userId: interaction.user.id,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error({
                    type: 'ERROR',
                    code: 'COMMAND_EXECUTION_ERROR',
                    message: 'Error executing command',
                    commandName: interaction.commandName,
                    error: error.message,
                    stack: error.stack,
                    guildId: interaction.guildId,
                    userId: interaction.user.id,
                    timestamp: new Date().toISOString()
                });
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        });

        /**
         * Login to Discord with the bot token
         * Starts the bot and connects to Discord's gateway
         */
        await bot.login(process.env.BOTTOKEN);
    } catch (error) {
        console.error({
            type: 'ERROR',
            message: 'Failed to initialize bot',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
})();
