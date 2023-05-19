const {joinVoiceChannel,createAudioPlayer} = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

async function play(interaction) {
    try {
        const channelId = interaction.member.voice.channelId;
        const channel = interaction.guild.channels.resolve(channelId);

        if (!channel) {
            await interaction.reply('You need to join a voice channel first!');
            return;
        }

        await interaction.deferReply();

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        player.stop();
        connection.destroy();

        await interaction.followUp('stop success!');

    } catch (error) {
        console.error(`Error in : ${error.message}`);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop Plays a song'),
    execute: play,
};
