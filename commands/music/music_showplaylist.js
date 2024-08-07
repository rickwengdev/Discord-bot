import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getPlaylist } from '../../datapackage/musicfunction/playerManager.js'
import ytdl from '@distube/ytdl-core';

async function viewPlaylist(interaction) {
    const playlist = getPlaylist(interaction.guild.id)
    // 创建嵌入消息
    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('播放列表')
        .setDescription('以下是当前播放列表中的歌曲：')

    // 创建字段数组
    const fields = [];

    // 为每首歌添加一个字段
    for (const songUrl of playlist) {
        try {
            const info = await ytdl.getInfo(songUrl);
            const title = info.videoDetails.title;
            const thumbnail = info.videoDetails.thumbnails[0].url;

            // 将歌曲信息添加到字段数组
            fields.push({
                name: title, // 歌曲标题
                value: '\u200b', // 空字符，用于保持字段之间的间隔
                inline: false
            });

            // 在嵌入中设置封面图（注意：封面图只能设置一次）
            embed.setThumbnail(thumbnail);

        } catch (error) {
            console.error('获取歌曲信息时出错:', error);
            fields.push({
                name: '错误',
                value: '无法获取歌曲信息',
                inline: false
            });
        }
    }

    // 使用 addFields 方法添加字段数组
    embed.addFields(fields);

    // 发送嵌入消息
    await interaction.reply({ embeds: [embed] });
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