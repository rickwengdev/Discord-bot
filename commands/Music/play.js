import { SlashCommandBuilder } from 'discord.js';
import { playNextSong } from '../../datapackge/musicfunction/playerManager.js';
export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from the playlist');

export async function execute(interaction) {
    // 檢查是否已經回覆或延遲
    if (interaction.deferred || interaction.replied) {
        return;
    }

    // 交互被延遲，使用回調函數處理回覆
    await interaction.deferReply({ ephemeral: true }).catch(console.error);

    try {
        // 在 playerManager.js 中處理連接和播放x
        const nextSongUrl = await playNextSong(interaction);
        if (nextSongUrl) {
            await interaction.followUp(`Playing the next song: ${nextSongUrl}`);
        } else {
            await interaction.followUp('The playlist is empty, please use /add to add a song.');
        }
    } catch (error) {
        console.error(`Error in play command: ${error.message}`);
        await interaction.followUp(`${error.message}`);
    }
}
