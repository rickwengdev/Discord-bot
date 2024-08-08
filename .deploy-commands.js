// 引入 Discord.js 的 REST 和 Routes 模組
import { REST, Routes } from 'discord.js';

// 引入 Node.js 模組
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import dotenv from 'dotenv';

dotenv.config(); // 從 .env 文件中加載環境變數

const commands = [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 指令存放的路徑
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// 遍歷所有指令文件夾
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // 遍歷每個指令文件
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        
        // 確認指令文件包含 'data' 和 'execute' 屬性
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] Directive in ${filePath} is missing a required "data" or "execute" attribute.`);
        }
    }
}

// 建立 REST 模組的實例並設置令牌
const rest = new REST({ version: '10' }).setToken(process.env.token);

// 部署應用 (/) 指令
(async () => {
    try {
        console.log(`Register APP token:${process.env.token}`)

        console.log(`🔄Start refreshing ${commands.length} application (/) commands.`);

        // 使用 put 方法來完全刷新伺服器中的所有指令
        const data = await rest.put(
            Routes.applicationCommands(process.env.clientId),
            { body: commands },
        );

        console.log(`✅Successfully reloaded ${data.length} application (/) directives.`);
    } catch (error) {
        // 確保捕獲並記錄任何錯誤
        console.error(error);
    }
})();