import { SlashCommandBuilder } from 'discord.js'
import { getMusicPlayer } from '../../datapackage/musicfunction/playerManager.js'

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_stop')
    .setDescription('Stop playing song')

// 执行 slash command 的函數
export async function execute(interaction) {
    interaction.deferReply();  // 立即回覆互動以避免超時
    const guildId = interaction.guild.id;
    const player = getMusicPlayer(guildId);
    await player.stopPlaying(interaction)
    await interaction.reply('Stopped playing song.')
}