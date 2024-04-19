import { SlashCommandBuilder} from "discord.js";

// 創建 Slash 命令
export const data = new SlashCommandBuilder()
    .setName('randomdinner')
    .setDescription('隨機晚餐')

// 執行 Slash 命令的處理函數
export async function execute(interaction) {
    const dinner = ["炒飯", "炒麵", "西北風", "牛排","MCC"];
    const randomdinner = dinner[Math.floor(Math.random() * dinner.length)]; // 從陣列中隨機選擇一個問候語
    interaction.reply('今天晚上吃：' + randomdinner);
}
