import { SlashCommandBuilder } from 'discord.js';
import { addSong } from '../../datapackge/musicfunction/playerManager.js';
import axios from 'axios';
import cheerio from 'cheerio';

async function is_valid_youtube_url(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        // If the video is not found, the title will be "YouTube"
        return $('title').text() !== 'YouTube';
    } catch (error) {
        console.error(`Error checking YouTube video: ${error}`);
        return false;
    }
}

async function addToPlaylist(interaction) {
    const songUrl = interaction.options.getString('url');

    const isValid = await is_valid_youtube_url(songUrl);
    if (!isValid) {
        return interaction.reply(`The URL ${songUrl} does not appear to be a valid YouTube video.`);
    }

    addSong(interaction.guild.id, songUrl);
    await interaction.reply(`Added ${songUrl} to the playlist.`);
}

export const data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a song to the playlist')
    .addStringOption(option =>
        option.setName('url')
        .setDescription('The URL of the song to add to the playlist')
        .setRequired(true));

export async function execute(interaction) {
    return addToPlaylist(interaction);
}
