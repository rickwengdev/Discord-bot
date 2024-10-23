import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
        .setName('randomchar')
        .setDescription('隨機返回一個使用者輸入的字')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('輸入的字串，用空白分割')
                .setRequired(true))
    
export async function execute(interaction) {
        // 獲取使用者輸入的字串
        const input = interaction.options.getString('input');

        // 分割字串，並去除多餘空白
        const words = input.trim().split(/\s+/);

        // 如果沒有單詞，則提示
        if (words.length === 0) {
            return interaction.reply('你沒有提供任何字。');
        }

        // 隨機選取其中一個單詞
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];

        // 回覆隨機選中的結果
        await interaction.reply(randomWord);
    };