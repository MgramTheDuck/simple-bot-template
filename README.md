# Discord Bot Template

A comprehensive Discord bot template built with Discord.js v14, featuring automatic command deployment, organized file structure, and comprehensive error handling.

## Features

- ✅ **Discord.js v14** - Latest version with full slash command support
- ✅ **Automatic Command Deployment** - Commands are automatically registered with Discord
- ✅ **Organized File Structure** - Commands can be organized in folders
- ✅ **Environment Variables** - Secure configuration with dotenv
- ✅ **Comprehensive Error Handling** - Detailed logging with timestamps
- ✅ **Async/Await Support** - Modern JavaScript patterns
- ✅ **Command Validation** - Validates command structure before loading

## Prerequisites

- Node.js 16.9.0 or higher
- A Discord application with bot token
- Basic knowledge of JavaScript and Discord.js

## Installation

1. **Clone or download this template**
   ```bash
   git clone <your-repo-url>
   cd bot-base
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   BOTTOKEN=your_bot_token_here
   CLIENTID=your_application_id_here
   ```

4. **Get your bot credentials**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application or select an existing one
   - Go to the "Bot" section to get your bot token
   - Go to the "General Information" section to get your application ID (Client ID)

## Usage

### Starting the Bot

```bash
npm start
```

This will:
1. Deploy all commands to Discord
2. Load commands into the bot
3. Start the bot and connect to Discord

### Registering Commands Only

If you only want to deploy/update commands without starting the bot:

```bash
npm run deploy
```

## Creating Commands

### Basic Command Structure

Commands should be placed in the `src/commands/` directory. Here's the basic structure:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),
    
    async execute(interaction) {
        await interaction.reply('Your response here');
    },
};
```

### Command Organization

You can organize commands in several ways:

1. **Root Level** - Place `.js` files directly in the `src/commands/` folder
2. **Subfolders** - Create subfolders in `src/commands/` to organize related commands
3. **Tooling Folder** - Use a `src/commands/tooling/` folder for utility modules (these are ignored by the command loader)

### Advanced Command Features

#### Adding Options

```javascript
data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('An example command with options')
    .addStringOption(option =>
        option.setName('input')
            .setDescription('Some input')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Select a user')),
```

#### Async Command Data (Advanced)

For commands that need to fetch data during registration:

```javascript
module.exports = {
    data: async () => {
        // Fetch some data or perform async operations
        const dynamicData = await fetchSomeData();
        
        return new SlashCommandBuilder()
            .setName('dynamic')
            .setDescription(`Dynamic command: ${dynamicData}`);
    },
    
    async execute(interaction) {
        // Your command logic here
    },
};
```

## Project Structure

```
bot-base/
├── src/                # Source code directory
│   ├── commands/       # Command files and folders
│   │   └── ping.js     # Example ping command
│   ├── deploy.js  # Command deployment script
│   ├── index.js        # Main bot file
│   └── botconfig.json  # Bot configuration
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
└── README.md          # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOTTOKEN` | Your Discord bot token | ✅ Yes |
| `CLIENTID` | Your Discord application ID | ✅ Yes |

## Error Handling

The bot includes comprehensive error handling with structured logging:

- **Command Loading Errors** - Invalid command files are logged but don't crash the bot
- **Command Execution Errors** - Runtime errors are caught and logged
- **Deployment Errors** - Command registration failures are handled gracefully
- **Missing Environment Variables** - The bot will exit with a helpful error message

All errors include timestamps and relevant context for debugging.

## Development Tips

1. **Testing Commands** - Use the `npm run deploy` command to update commands without restarting the bot
2. **Debugging** - Check the console output for detailed error messages and execution logs
3. **Command Validation** - The bot validates that commands have both `data` and `execute` properties
4. **Hot Reloading** - Restart the bot after making changes to see updates

## Common Issues

### Bot Not Responding to Commands

1. Make sure commands are properly registered (`npm run deploy`)
2. Check that your bot has the necessary permissions in your Discord server
3. Verify that your bot token and client ID are correct in the `.env` file

### Command Not Found Errors

1. Ensure your command file exports both `data` and `execute` properties
2. Check that the file is in the `src/commands/` directory or a subdirectory
3. Verify the command file has a `.js` extension

### Permission Errors

1. Make sure your bot has the `applications.commands` scope
2. Ensure the bot has permission to send messages in the channels where commands are used

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API Documentation](https://discord.com/developers/docs)

## Support

If you encounter any issues or have questions:

1. Check the console output for error messages
2. Refer to the Discord.js documentation
3. Create an issue in this repository
4. Join the Discord.js community server for help

---

*This template provides a solid foundation for building Discord bots with modern JavaScript and Discord.js v14.*
