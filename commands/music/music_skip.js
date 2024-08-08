import { SlashCommandBuilder } from 'discord.js'
import { getMusicPlayer } from '../../datapackage/musicfunction/playerManager.js'

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_skip')
    .setDescription('Jump to next song')

// 执行 slash command 的函數
export async function execute(interaction) {
    const guildId = interaction.guild.id;
    const player = getMusicPlayer(guildId);
    player.skipToNextSong()
    await interaction.reply('Jumped to next song.')}
