import { SlashCommandBuilder } from 'discord.js'
import { getPlaylist } from '../../datapackage/musicfunction/playerManager.js'

async function viewPlaylist(interaction) {
    const playlist = getPlaylist(interaction.guild.id)

    if (playlist.length === 0) {
        // 若播放列表為空，回覆訊息
        await interaction.reply('播放列表是空的。')
    } else {
        // 若有歌曲，回覆播放列表內容
        await interaction.reply('播放列表:\n' + playlist.join('\n'))
    }
}

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_showplaylist')
    .setDescription('顯示當前播放列表')

// 執行 slash command 的函數
export async function execute(interaction) {
    // 調用 viewPlaylist 函數顯示播放列表
    return viewPlaylist(interaction)
}