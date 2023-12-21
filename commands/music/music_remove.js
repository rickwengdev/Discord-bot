import { SlashCommandBuilder } from 'discord.js';
import { removeSong } from '../../datapackge/musicfunction/playerManager.js';

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_remove')
    .setDescription('Remove a song from the playlist')
    .addStringOption(option => 
        option.setName('url')
        .setDescription('The URL of the song to remove from the playlist')
        .setRequired(true));

// 執行 slash command 的函數
export async function execute(interaction) {
    // 獲取指定的歌曲 URL
    const songUrl = interaction.options.getString('url');

    // 使用 removeSong 函數從播放列表中刪除歌曲
    removeSong(interaction.guild.id, songUrl);

    // 回覆互動，確認已從播放列表中移除歌曲
    await interaction.reply(`Removed ${songUrl} from the playlist.`);
}
