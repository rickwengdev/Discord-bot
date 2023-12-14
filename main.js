import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import { Client, Partials, Events, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// 創建 Discord 客戶端
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 創建用於存儲命令的集合
client.commands = new Collection();

// 獲取當前文件的路徑和目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 定義命令文件夾的路徑
const foldersPath = path.join(__dirname, 'commands');

// 獲取所有命令文件夾
const commandFolders = fs.readdirSync(foldersPath);

// 加載所有命令文件
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);

        // 檢查命令文件是否包含必需的屬性
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// 處理互動事件
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        // 執行命令，捕獲互動已回復的錯誤
        try {
            await command.execute(interaction);
        } catch (error) {
            if (error.code !== 'InteractionAlreadyReplied') {
                console.error('Error executing command:', error);
            }
        }
    } catch (error) {
        console.error(error);
        // 回覆錯誤給用戶
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// 客戶端準備好後輸出日誌
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// 登錄到 Discord
client.login(process.env.token);