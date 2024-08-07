import { SlashCommandBuilder } from 'discord.js'
import { skipToNextSong } from '../../datapackage/musicfunction/playerManager.js'

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_skip')
    .setDescription('跳轉到下一首歌曲')

// 执行 slash command 的函數
export async function execute(interaction) {
    await skipToNextSong()
    console.log(`${interaction.user.username} 已跳轉到下一首歌曲。}`)
}
