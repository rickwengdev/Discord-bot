import { SlashCommandBuilder } from "discord.js"
import fs from "fs/promises"

const dinnerlistPath = 'datapackage/fun/dinner.json' // 指定檔案路徑

// 創建 Slash 命令
export const data = new SlashCommandBuilder()
    .setName('fun_randomdinner')
    .setDescription('晚餐困難症好幫手')

// 執行 Slash 命令的處理函數
export async function execute(interaction) {
    try {
        // 異步讀取 JSON 檔案
        const data = await fs.readFile(dinnerlistPath, 'utf-8')
        const allDinners = JSON.parse(data) // 解析 JSON 資料

        // 獲取特定鍵的晚餐選項數組
        const dinners = allDinners[interaction.guildId] || allDinners["default"]

        // 檢查是否有可用的晚餐選項
        if (dinners.length === 0) {
            await interaction.reply('晚餐列表為空，請先添加一些晚餐選項！')
            return
        }

        // 從數組中隨機選擇一個晚餐
        const randomDinner = dinners[Math.floor(Math.random() * dinners.length)]
        await interaction.reply('今天晚上吃：' + randomDinner)
    } catch (error) {
        // 錯誤處理
        console.error('讀取晚餐列表失敗:', error)
        await interaction.reply('無法讀取晚餐列表，請檢查文件系統或聯繫管理員！')
    }
}