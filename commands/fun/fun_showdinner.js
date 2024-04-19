import { SlashCommandBuilder } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import fs from 'fs/promises' // 使用 fs 的 promises 介面

const dinnerlistPath = 'datapackage/fun/dinner.json' // 指定 JSON 文件的路徑

// 創建 Slash 命令
export const data = new SlashCommandBuilder()
    .setName('fun_showdinner')
    .setDescription('顯示所有晚餐選項')

// 執行 Slash 命令的處理函數
export async function execute(interaction) {
    try {
        // 異步讀取 JSON 文件
        const data = await fs.readFile(dinnerlistPath, 'utf-8')
        const dinners = JSON.parse(data) // 解析 JSON 資料

        // 獲取當前伺服器的 ID 作為鍵來獲取晚餐選項陣列
        const guildId = interaction.guildId
        const dinnerOptions = dinners[guildId] // 使用 guildId 從對象中取得晚餐列表

        // 檢查解析出的資料是否為陣列
        if (!Array.isArray(dinnerOptions) || dinnerOptions.length === 0) {
            await interaction.reply('當前晚餐列表為空，請添加一些晚餐選項！')
            return
        }

        // 創建一個 embed 來顯示晚餐列表
        const dinnerEmbed = new EmbedBuilder()
            .setColor('#0099ff') // 設置 embed 的顏色
            .setTitle('晚餐選項列表') // 設置 embed 的標題
            .setDescription(dinnerOptions.join('\n')) // 將所有晚餐選項加入描述，每個選項一行
            .setTimestamp() // 嵌入時間戳

        // 使用 embed 發送響應
        await interaction.reply({ embeds: [dinnerEmbed] })
    } catch (error) {
        console.error('讀取晚餐列表失敗:', error)
        await interaction.reply('無法讀取晚餐列表，請檢查文件系統或聯繫管理員！')
    }
}