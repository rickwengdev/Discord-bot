const fs = require('node:fs')
const path = require('node:path')
const {Client, Events, GatewayIntentBits, Collection,Partials} = require('discord.js')
const {token} = require('./config.json')
const {handleReactionRole} = require('./roleManager.js');
/////BASIC CODE/////
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.GuildMessageReactions],
							partials: [Partials.Message, Partials.Channel, Partials.Reaction]})

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		try {
			await command.execute(interaction);
		} catch (error) {
			if (error.code !== 'InteractionAlreadyReplied') {
				console.error('Error executing command:', error);
			}
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
});

///function code///
client.on('messageReactionAdd', async (reaction, user) => {
    
});

client.login(token)