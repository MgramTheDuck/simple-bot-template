/**
 * @fileoverview Command deployment utility for Discord bot - handles registering slash commands with Discord API
 * @version 1.0.0
 */

const {REST, Routes} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config()

/**
 * Deploys all bot commands to Discord API
 * Recursively loads commands from the commands directory and registers them globally
 * @async
 * @function deploy
 * @returns {Promise<Array>} Array of deployed command data from Discord API
 * @throws {Error} When command deployment fails or environment variables are missing
 */
async function deploy() {
    /**
     * Path to the commands directory
     * @type {string}
     */
    const foldersPath = path.join(__dirname, 'commands');

    /**
     * Array of folder names in the commands directory
     * @type {string[]}
     */
    const commandFolders = fs.readdirSync(foldersPath).filter(item => {
        const itemPath = path.join(foldersPath, item);
        return fs.statSync(itemPath).isDirectory();
    });

    /**
     * Collection of command modules for batch processing
     * @type {Array<Object>}
     */
    // Collect commands for async processing
    const commandModules = [];

    /**
     * Handle commands in the root of the commands directory
     * Processes .js files directly in the commands folder
     */
    // --- Handle commands in the root of the commands directory ---
    const rootCommandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
    for (const file of rootCommandFiles) {
        const filePath = path.join(foldersPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commandModules.push(command);
        } else {
            console.error({
                type: 'ERROR',
                code: 'COMMAND_MISSING_PROPERTIES',
                message: `The command at ${filePath} is missing a required "data" or "execute" property (root).`,
                filePath,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Handle commands in subdirectories
     * Recursively processes command files in subdirectories of the commands folder
     */
    // --- Handle commands in subdirectories ---
    for (const folder of commandFolders) {
        // Grab all the command files from the commands directory you created earlier
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        // Load command modules
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commandModules.push(command);
            } else {
                console.log({
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
     * Discord REST API client instance
     * @type {REST}
     */
    const rest = new REST().setToken(process.env.BOTTOKEN);

    try {
        /**
         * Process all command modules and convert to JSON format
         * Handles both async data functions and regular SlashCommandBuilder objects
         * @type {Array<Object>}
         */
        const commands = await Promise.all(
                commandModules.map(async (command) => {
                    // Handle both async functions and regular SlashCommandBuilder objects
                    if (typeof command.data === 'function') {
                        return (await command.data()).toJSON();
                    } else {
                        return command.data.toJSON();
                    }
                })
            );

        console.log({
            type: 'INFO',
            message: `Started refreshing ${commands.length} application (/) commands.`,
            commandCount: commands.length,
            timestamp: new Date().toISOString()
        });

        /**
         * Deploy commands to Discord API
         * Uses PUT method to fully refresh all global application commands
         * @type {Array}
         */
        const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENTID),
                {body: commands},
            );

        console.log({
            type: 'INFO',
            message: `Successfully reloaded ${data.length} application (/) commands.`,
            commandCount: data.length,
            clientId: process.env.CLIENTID,
            timestamp: new Date().toISOString()
        });
        return data;
    } catch (error) {
        console.error({
            type: 'ERROR',
            code: 'COMMAND_DEPLOY_ERROR',
            message: 'Error deploying commands',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

/**
 * Export the deploy function for use in other modules
 * @module deployCommands
 */
module.exports = {deployCommands: deploy};

// Run the function if the file is executed directly
if (require.main === module) {
    deploy().catch(error => {
        console.error({
            type: 'ERROR',
            code: 'COMMAND_DEPLOY_ERROR',
            message: 'Error deploying commands',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    });
}
