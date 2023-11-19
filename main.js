import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path,{ dirname } from 'node:path';
import { Client, Partials, Events, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates] ,partials: [Partials.Message, Partials.Channel, Partials.Reaction]});



client.commands = new Collection();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
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

client.login(process.env.token)