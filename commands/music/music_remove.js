import { SlashCommandBuilder } from 'discord.js'
import { getMusicPlayer } from '../../datapackage/musicfunction/playerManager.js'

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_remove')
    .setDescription('Remove a song from a playlist')
    .addStringOption(option => 
        option.setName('url')
        .setDescription('The URL of the song to remove from the playlist')
        .setRequired(true))

// 定義 slash command 執行函數
export async function execute(interaction) {
    interaction.deferReply();  // 立即回覆互動以避免超時
    // 獲取伺服器 ID 和播放器實例
    const guildId = interaction.guild.id;
    const player = getMusicPlayer(guildId);
    // 獲取指定的歌曲 URL
    const songUrl = interaction.options.getString('url')

    // 使用 removeSong 函數從播放列表中刪除歌曲
    player.removeSong(songUrl)

    const info = await ytdl.getBasicInfo(songUrl);

    // 檢查是否成功獲取視頻信息
    if (!info || !info.videoDetails) {
        return interaction.editReply(`Unable to get video information for the provided URL ${songUrl}.`);
    }

    // 回覆刪除成功的訊息
    if (info){
        const embed = new EmbedBuilder()
            .setColor('#FF0000')  // YouTube 紅色
            .setTitle(info.videoDetails.title)
            .setThumbnail(info.videoDetails.thumbnails[0].url);
        await interaction.editReply({content:`${songUrl} has been removed from the playlist.`, embeds: [embed] });
    }else{
        await interaction.editReply({content:`${songUrl} has been removed from the playlist.`});
    }
}