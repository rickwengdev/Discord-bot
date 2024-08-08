import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getMusicPlayer, errorhandler } from '../../datapackage/musicfunction/playerManager.js'
import ytdl from '@distube/ytdl-core';

async function viewPlaylist(interaction) {
    const guildId = interaction.guild.id;
    const player = getMusicPlayer(guildId);
    const playlist = player.getPlaylist();
    // 創建一個嵌入
    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('playlist')
        .setDescription('Here are the songs in the current playlist:')

    // 創建一個空的字段數組
    const fields = [];

    // 遍歷播放列表中的每個歌曲
    for (const songUrl of playlist) {
        try {
            const info = await ytdl.getBasicInfo(songUrl);
            const title = info.videoDetails.title;
            const thumbnail = info.videoDetails.thumbnails[0].url;

            // 將歌曲信息添加到字段數組
            fields.push({
                name: title, // 歌曲標題
                value: songUrl, // 歌曲 URL
                inline: false
            });

            // 在第一個字段中添加歌曲縮略圖
            embed.setThumbnail(thumbnail);

        } catch (error) {
            errorhandler(error);
            fields.push({
                name: 'error',
                value: 'Unable to get song information',
                inline: false
            });
        }
    }

    // 使用 addFields 方法將字段數組添加到嵌入
    embed.addFields(fields);

    // 回覆互動並顯示播放列表
    await interaction.reply({ embeds: [embed] });
}

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_showplaylist')
    .setDescription('Show current playlist')

// 定義 slash command 執行函數
export async function execute(interaction) {
    // 調用 viewPlaylist 函數顯示播放列表
    return viewPlaylist(interaction)
}