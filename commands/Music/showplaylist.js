import { SlashCommandBuilder } from 'discord.js'
import { getPlaylist } from '../../playerManager.js'

async function viewPlaylist(interaction) {
    const playlist = getPlaylist(interaction.guild.id)
    if (playlist.length === 0) {
        await interaction.reply('The playlist is empty.')
    } else {
        await interaction.reply('The playlist is:\n' + playlist.join('\n'))
    }
}

export const data = new SlashCommandBuilder()
        .setName('showplaylist')
        .setDescription('show the current playlist')
    export async function execute(interaction){
        return viewPlaylist(interaction)
    }
