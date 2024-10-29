import { readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import { Client, Partials, Events, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { messageReaction } from './datapackage/modfunction/messageReaction.js';
import { GuildMembers } from './datapackage/modfunction/guildMember.js';
import { dynamicvoicechannel } from './datapackage/modfunction/dynamicVoiceChannel.js';
import { setupLogging } from './datapackage/modfunction/logservermessage.js';
import { startYouTubeFollowRSS } from './datapackage/modfunction/followYTchannels.js';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const foldersPath = path.join(__dirname, 'commands');

const commandFolders = readdirSync(foldersPath).filter(folder => {
    const folderPath = path.join(foldersPath, folder);
    return statSync(folderPath).isDirectory();
});

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') && statSync(path.join(commandsPath, file)).isFile());

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        import(filePath)
            .then(command => {
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command in ${filePath} is missing a required "data" or "execute" attribute.`);
                }
            })
            .catch(error => {
                console.error(`[ERROR] Failed to load command ${filePath}:`, error);
            });
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} found.`);
        return;
    }

    try {
        try {
            await command.execute(interaction);
        } catch (error) {
            if (error.code !== 'InteractionAlreadyReplied') {
                console.error('An error occurred while executing the command:', error);
            }
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while executing this command!', ephemeral: true });
    }
});

client.once(Events.ClientReady, c => {
    console.log(`✅Ready! Signed in as ${c.user.tag}`);

    // 設置機器人狀態
    client.user.setPresence({ activities: [{ name: 'DISCORD.JS' }], status: 'dnd' });

    // 調用 setup() 函數以設定所有功能
    setup();
});

export function setup() {
    // 設置訊息反應事件
    messageReaction(client);

    // 設置用戶加入伺服器事件
    const guildMembers = new GuildMembers(client);
    guildMembers.guildMember(client);

    // 設置自動語音頻道功能
    dynamicvoicechannel(client);

    // 設置日誌功能
    setupLogging(client);

    // 其他需要初始化的功能...
}

// 登錄到 Discord
client.login(process.env.token);