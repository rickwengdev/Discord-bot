import {SlashCommandBuilder } from 'discord.js';
import { skipToNextSong } from '../../playerManager.js';

export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('go to next song')
export async function execute(interaction) {
        await interaction.deferReply();
            try {
                await skipToNextSong(interaction);
                await interaction.followUp('Playing the next song from the playlist');
            } catch (error) {
                console.error(`Error in play command: ${error.message}`);
                await interaction.followUp(`Failed to play the song: ${error.message}`);
            }
    }
