import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import ytdl from '@distube/ytdl-core';
import path from 'path';
import { errorhandler } from '../../datapackage/musicfunction/playerManager.js';

const downloadPath = path.resolve('./downloads');

// 檢查並創建下載文件夾
try {
    await fs.access(downloadPath);
} catch (error) {
    if (error.code === 'ENOENT') {
        await fs.mkdir(downloadPath);
    } else {
        throw error;
    }
}

async function downloadMp3(url, filename) {
    const filePath = path.join(downloadPath, filename);

    return new Promise((resolve, reject) => {
        const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

        audio.pipe(createWriteStream(filePath))
            .on('finish', () => resolve(filePath))
            .on('error', reject);
    });
}

async function downloadAndUploadVideo(interaction) {
    try {
        await interaction.deferReply();

        const videoUrl = interaction.options.getString('url');
        const info = await ytdl.getBasicInfo(videoUrl);
        if (!info || !info.videoDetails) {
            return interaction.editReply(`無法獲取影片信息: ${videoUrl}`);
        }

        const videoTitle = info.videoDetails.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const mp3Filename = `${videoTitle}.mp3`;

        // 下載 MP3 文件
        const mp3Path = await downloadMp3(videoUrl, mp3Filename);

        // 檢查文件大小
        const stats = await fs.stat(mp3Path);
        const fileSizeInMB = stats.size / (1024 * 1024);
        if (fileSizeInMB > 8) {  // 8MB for standard users
            return interaction.editReply(`文件過大（${fileSizeInMB.toFixed(2)} MB），超過了 Discord 的上傳限制。`);
        }

        // 創建嵌入消息
        const embed = new EmbedBuilder()
            .setColor('#FF0000')  // YouTube 紅色
            .setTitle(info.videoDetails.title)
            .setURL(info.videoDetails.video_url) // 添加視頻 URL
            .setDescription(`**作者**: ${info.videoDetails.author.name}\n**時長**: ${formatDuration(info.videoDetails.lengthSeconds)}`)
            .setThumbnail(info.videoDetails.thumbnails[0].url)
            .setFooter({ text: '感謝使用我們的音樂機器人!' });

        // 下載完成，發送嵌入消息並上傳文件
        await interaction.editReply({ 
            embeds: [embed],
            files: [mp3Path]
        });

        // 清理下載的文件
        await fs.unlink(mp3Path);
    } catch (error) {
        errorhandler(error);
        interaction.editReply('下載或上傳影片時發生錯誤。');
    }
}

// 幫助函數：格式化時長
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} 分 ${secs} 秒`;
}

export const data = new SlashCommandBuilder()
    .setName('download_video')
    .setDescription('下載 YouTube 影片的 MP3 音頻')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('YouTube 影片的 URL')
            .setRequired(true));

export async function execute(interaction) {
    await downloadAndUploadVideo(interaction);
}