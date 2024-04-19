import { SlashCommandBuilder } from 'discord.js'
import { removeSong } from '../../datapackage/musicfunction/playerManager.js'

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_remove')
    .setDescription('從播放列表中移除一首歌曲')
    .addStringOption(option => 
        option.setName('url')
        .setDescription('要從播放列表中移除的歌曲的 URL')
        .setRequired(true))

// 執行 slash command 的函數
export async function execute(interaction) {
    // 獲取指定的歌曲 URL
    const songUrl = interaction.options.getString('url')

    // 使用 removeSong 函數從播放列表中刪除歌曲
    removeSong(interaction.guild.id, songUrl)

    // 回覆互動，確認已從播放列表中移除歌曲
    await interaction.reply(`已從播放列表移除 ${songUrl}。`)
}