import { SlashCommandBuilder } from 'discord.js';
import { removeSong } from '../../playerManager.js';

export const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the playlist')
    .addStringOption(option => 
        option.setName('url')
        .setDescription('The URL of the song to remove from the playlist')
        .setRequired(true));

export async function execute(interaction) {
    const songUrl = interaction.options.getString('url');
    removeSong(interaction.guild.id, songUrl);
    await interaction.reply(`Removed ${songUrl} from the playlist.`);
}
