const { SlashCommandBuilder } = require('discord.js');

// This command is a simple ping command that replies with "pong!" when invoked

// Module.exports indicates that this file exports an object containing the command data and the execute function
module.exports = {
    // The command data structure defines the command's name and description and is used to register the command with Discord
    // You can add more options to the command data if needed: https://discordjs.guide/slash-commands/parsing-options.html#command-options
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    async execute(interaction) { // The execute function is called when the command is invoked
        await interaction.reply('pong!');
    },
};
