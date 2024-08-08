import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getMusicPlayer, errorhandler } from '../../datapackage/musicfunction/playerManager.js';
import axios from 'axios';
import cheerio from 'cheerio';
import ytdl from '@distube/ytdl-core';

// 檢查是否為有效的 YouTube 鏈接
async function is_valid_youtube_url(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        // 如果頁面標題不是 "YouTube"，則視為有效的 YouTube 鏈接
        return $('title').text() !== 'YouTube';
    } catch (error) {
        console.error(`Check youtube url error：${error}`);
        return false;
    }
}

// 添加歌曲到播放列表
async function addToPlaylist(interaction) {
    try {
        interaction.deferReply();

        const songUrl = interaction.options.getString('url');

        // 檢查是否為有效的 YouTube 鏈接
        const isValid = await is_valid_youtube_url(songUrl);
        if (!isValid) {
            return interaction.editReply(`The provided URL ${songUrl} does not appear to be a valid YouTube video.`);
        }

        // 獲取伺服器播放器實例
        const guildId = interaction.guild.id;
        const player = getMusicPlayer(guildId);

        // 将歌曲添加到播放列表
        player.addSong(songUrl);

        const info = await ytdl.getBasicInfo(songUrl);

        // 檢查是否成功獲取視頻信息
        if (!info || !info.videoDetails) {
            return interaction.editReply(`Unable to get video information for the provided URL ${songUrl}.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')  // YouTube 紅色
            .setTitle(info.videoDetails.title)
            .setThumbnail(info.videoDetails.thumbnails[0].url);

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        errorhandler(error);
    }
}

// 定義 Slash Command
export const data = new SlashCommandBuilder()
    .setName('music_add')
    .setDescription('Add a song to a playlist')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('The URL of the song to add to the playlist')
            .setRequired(true));

// 定義 Slash Command 執行函數
export async function execute(interaction) {
    await addToPlaylist(interaction);
}