import { SlashCommandBuilder } from 'discord.js';
import { getMusicPlayer } from '../../datapackage/musicfunction/playerManager.js';

// 定義 Slash Command
export const data = new SlashCommandBuilder()
    .setName('music_play')
    .setDescription('Play the first song in the playlist');

// 定義 Slash Command 執行函數
export async function execute(interaction) {
    await interaction.deferReply(); // 立即回覆互動以避免超時

    const guildId = interaction.guild.id;
    const player = getMusicPlayer(guildId);
    player.playSong(interaction);
}