import { SlashCommandBuilder } from 'discord.js'
import { playNextSong } from '../../datapackage/musicfunction/playerManager.js'

// 定義 slash command 的基本資訊
export const data = new SlashCommandBuilder()
    .setName('music_play')
    .setDescription('播放播放列表中的一首歌曲')

// 執行 slash command 的主函數
export async function execute(interaction) {
        // 檢查互動是否已經被回應
        if (interaction.deferred || interaction.replied) {
            console.log('互動已經被回應。')
            return
        } else {
            interaction.reply('開始播放歌曲。')
        }

        // 在 playerManager.js 中處理連接和播放
        playNextSong(interaction)
}