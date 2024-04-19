// 引入 Node.js 模組
import { readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'node:url'
import path, { dirname } from 'node:path'

// 引入 Discord.js 模組
import { Client, Partials, Events, Collection, GatewayIntentBits } from 'discord.js'

// 引入 dotenv 模組，用於載入環境變數
import dotenv from 'dotenv'

// 引入自定義模組，處理日誌相關功能
import { setupLogEvents } from './datapackage/modfunction/log.js'

// 引入自定義模組，處理訊息反應相關功能
import { messageReaction } from './datapackage/modfunction/messageReaction.js'

// 引入自定義模組，處理用戶加入伺服器相關功能
import { guildMember } from './datapackage/botfunction/guildMember.js'

// 引入自定義模組，處理自動語音頻道相關功能
import { dynamicvoicechannel } from './datapackage/botfunction/dynamicVoiceChannel.js'

// 載入 .env 文件中的環境變數
dotenv.config()

// 創建 Discord 客戶端
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

// 創建用於存儲命令的集合
client.commands = new Collection()

// 獲取當前文件的路徑和目錄
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 定義命令文件夾的路徑
const foldersPath = path.join(__dirname, 'commands')

// 獲取所有命令文件夾，並確保只讀取目錄
const commandFolders = readdirSync(foldersPath).filter(folder => {
    const folderPath = path.join(foldersPath, folder)
    return statSync(folderPath).isDirectory()
});

// 加載所有命令文件
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') && statSync(path.join(commandsPath, file)).isFile())

    // 遍歷每個命令文件
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = await import(filePath)

        // 檢查命令文件是否包含必需的屬性
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log(`[警告] 在 ${filePath} 中的命令缺少必要的 "data" 或 "execute" 屬性。`)
        }
    }
}

// 處理互動事件
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
        console.error(`未找到匹配 ${interaction.commandName} 的命令。`)
        return
    }

    try {
        // 執行命令，捕獲互動已回復的錯誤
        try {
            await command.execute(interaction)
        } catch (error) {
            if (error.code !== 'InteractionAlreadyReplied') {
                console.error('執行命令時發生錯誤:', error)
            }
        }
    } catch (error) {
        console.error(error)
        // 回覆錯誤給用戶
        await interaction.reply({ content: '執行此命令時發生錯誤！', ephemeral: true })
    }
});

// 設置客戶端狀態
client.on('ready', () => {
    client.user.setPresence({ activities: [{ name: '死神塔' }], status: 'dnd' })
})

// 客戶端準備好後輸出日誌
client.once(Events.ClientReady, c => {
    console.log(`就緒！已登入為 ${c.user.tag}`)
});

// 設置日誌事件
setupLogEvents(client)

// 設置訊息反應事件
messageReaction(client)

// 設置用戶加入伺服器事件
guildMember(client)

// 設置自動語音頻道功能
dynamicvoicechannel(client)

// 登錄到 Discord
client.login(process.env.token)