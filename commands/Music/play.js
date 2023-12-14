import { SlashCommandBuilder } from 'discord.js';
import { playNextSong } from '../../datapackge/musicfunction/playerManager.js';

// 定義 slash command 的基本資訊
export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from the playlist');

// 执行 slash command 的主函數
export async function execute(interaction) {
    try {
        // 在 playerManager.js 中處理連接和播放
        const songUrl = await playNextSong(interaction);
        
        // 根據播放結果回覆用戶
        if (songUrl) {
            await interaction.reply(`Playing the next song`);
            console.log(songUrl);
        } else {
            await interaction.reply('The playlist is empty, please use /add to add a song.');
        }
    } catch (error) {
        // 處理錯誤情況，並回覆錯誤信息給用戶
        console.error(`Error in play command: ${error.message}`);
        await interaction.reply(`${error.message}`);
    }
}
