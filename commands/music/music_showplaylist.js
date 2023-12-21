import { SlashCommandBuilder } from 'discord.js';
import { getPlaylist } from '../../datapackge/musicfunction/playerManager.js';

/**
 * 顯示當前播放列表的內容
 * @param {Object} interaction - 代表用戶和機器人之間的互動
 */
async function viewPlaylist(interaction) {
    const playlist = getPlaylist(interaction.guild.id);

    if (playlist.length === 0) {
        // 若播放列表為空，回覆訊息
        await interaction.reply('The playlist is empty.');
    } else {
        // 若有歌曲，回覆播放列表內容
        await interaction.reply('The playlist is:\n' + playlist.join('\n'));
    }
}

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_showplaylist')
    .setDescription('Show the current playlist');

// 執行 slash command 的函數
export async function execute(interaction) {
    // 調用 viewPlaylist 函數顯示播放列表
    return viewPlaylist(interaction);
}
