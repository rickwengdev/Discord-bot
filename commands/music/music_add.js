import { SlashCommandBuilder } from 'discord.js'
import { addSong } from '../../datapackage/musicfunction/playerManager.js'
import axios from 'axios'
import cheerio from 'cheerio'

// 檢查是否為有效的 YouTube 鏈接
async function is_valid_youtube_url(url) {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)
        // 如果找不到視頻，標題將是 "YouTube"
        return $('title').text() !== 'YouTube'
    } catch (error) {
        console.error(`檢查 YouTube 視頻時發生錯誤：${error}`)
        return false
    }
}

// 添加歌曲到播放列表
async function addToPlaylist(interaction) {
    const songUrl = interaction.options.getString('url')

    // 檢查 YouTube 鏈接是否有效
    const isValid = await is_valid_youtube_url(songUrl)
    if (!isValid) {
        return interaction.reply(`提供的 URL ${songUrl} 似乎不是一個有效的 YouTube 視頻。`)
    }

    // 將歌曲添加到播放列表
    addSong(interaction.guild.id, songUrl)
    await interaction.reply(`已將 ${songUrl} 添加到播放列表。`)
}

// 定義 Slash Command
export const data = new SlashCommandBuilder()
    .setName('music_add')
    .setDescription('將一首歌曲添加到播放列表')
    .addStringOption(option =>
        option.setName('url')
        .setDescription('要添加到播放列表的歌曲的 URL')
        .setRequired(true))

// 執行 Slash Command
export async function execute(interaction) {
    return addToPlaylist(interaction)
}