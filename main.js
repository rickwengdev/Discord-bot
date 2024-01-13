// 引入 Node.js 模組
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

// 引入 Discord.js 模組
import { Client, Partials, Events, Collection, GatewayIntentBits } from 'discord.js';

// 引入 dotenv 模組，用於載入環境變數
import dotenv from 'dotenv';

// 引入自定義模組，處理角色管理相關功能
import { addRoleFromReaction, removeRoleFromReaction } from './datapackge/modfunction/roleManager.js';

// 載入 .env 文件中的環境變數
dotenv.config();

// 創建 Discord 客戶端
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
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

    // 遍歷每個命令文件
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);

        // 檢查命令文件是否包含必需的屬性
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[警告] 在 ${filePath} 中的命令缺少必要的 "data" 或 "execute" 屬性。`);
        }
    }
}

// 處理互動事件
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`未找到匹配 ${interaction.commandName} 的命令。`);
        return;
    }

    try {
        // 執行命令，捕獲互動已回復的錯誤
        try {
            await command.execute(interaction);
        } catch (error) {
            if (error.code !== 'InteractionAlreadyReplied') {
                console.error('執行命令時發生錯誤:', error);
            }
        }
    } catch (error) {
        console.error(error);
        // 回覆錯誤給用戶
        await interaction.reply({ content: '執行此命令時發生錯誤！', ephemeral: true });
    }
});

// 客戶端準備好後輸出日誌
client.once(Events.ClientReady, c => {
    console.log(`就緒！已登入為 ${c.user.tag}`);
});

client.on('ready', () => {
    // 設置客戶端狀態
    client.user.setPresence({ activities: [{ name: '死神塔' }], status: 'dnd' });
});

// 處理訊息反應新增事件
client.on('messageReactionAdd', async (reaction, user) => {
    const targetMessageId = '1194879627966029844';
    if (reaction.message.id === targetMessageId) {
        addRoleFromReaction(reaction, user);
    }
});

// 處理訊息反應移除事件
client.on('messageReactionRemove', async (reaction, user) => {
    const targetMessageId = '1194879627966029844';
    if (reaction.message.id === targetMessageId) {
        removeRoleFromReaction(reaction, user);
    }
});

// 登錄到 Discord
client.login(process.env.token);