import { SlashCommandBuilder } from 'discord.js'
import { downloadSong } from '../../datapackage/musicfunction/playerManager.js'

// 定義 slash command 的基本資訊
export const data = new SlashCommandBuilder()
    .setName('music_download')
    .setDescription('download a song from youtube')
    .addStringOption(option =>
        option.setName('url')
        .setDescription('The URL of the song to download to the local')
        .setRequired(true));

// 执行 slash command 的主函數
export async function execute(interaction) {
        const url = interaction.options.getString('url')
        downloadSong(interaction,url)
}