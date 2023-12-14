import { SlashCommandBuilder } from 'discord.js';
import { skipToNextSong } from '../../datapackge/musicfunction/playerManager.js';

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('跳轉到下一首歌曲');

// 执行 slash command 的函數
export async function execute(interaction) {
    // 優化：使用 deferReply({ ephemeral: true }) 以降低響應可見性
    await interaction.deferReply({ ephemeral: true });

    try {
        // 調用跳轉到下一首歌曲的功能
        await skipToNextSong(interaction);

        // 回覆用戶成功消息
        await interaction.followUp('正在播放播放列表中的下一首歌曲');
    } catch (error) {
        // 捕獲並處理錯誤
        console.error(`Error in skip command: ${error.message}`);

        // 回覆用戶失敗消息，包含錯誤信息
        await interaction.followUp(`無法跳轉到下一首歌曲: ${error.message}`);
    }
}
