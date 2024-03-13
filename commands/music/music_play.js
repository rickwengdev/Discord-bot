import { SlashCommandBuilder } from 'discord.js';
import { playNextSong } from '../../datapackge/musicfunction/playerManager.js';

// 定義 slash command 的基本資訊
export const data = new SlashCommandBuilder()
    .setName('music_play')
    .setDescription('Plays a song from the playlist');

// 执行 slash command 的主函數
export async function execute(interaction) {
        // Check if the interaction is already acknowledged
        if (interaction.deferred || interaction.replied) {
            console.log('Interaction already acknowledged.');
            return;
        } else {
            interaction.reply('Play song.');
        }

        // 在 playerManager.js 中處理連接和播放
        playNextSong(interaction);
}
