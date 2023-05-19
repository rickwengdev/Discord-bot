const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    demuxProbe,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { SlashCommandBuilder } = require('discord.js');

async function play(interaction) {
    try {
        const channelId = interaction.member.voice.channelId;
        const channel = interaction.guild.channels.resolve(channelId);

        if (!channel) {
            await interaction.reply('You need to join a voice channel first!');
            return;
        }

        const videoUrl = interaction.options.getString('url');

        await interaction.deferReply();

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        connection.subscribe(player);

        const stream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25, // 32MB
        });

        const { stream: outputStream, type } = await demuxProbe(stream);

        const resource = createAudioResource(outputStream, {
            inputType: type,
            channels: 2,
            inlineVolume: true,
        });

        player.play(resource);

        player.on('error', error => {
            console.error(`Error from audio player: ${error.message}`);
        });

        player.on('idle', () => {
            connection.destroy();
        });

        await interaction.followUp(`Playing ${videoUrl}`);
    } catch (error) {
        console.error(`Error in play command: ${error.message}`);
    }
}



module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube')
        .addStringOption(option => 
            option.setName('url')
            .setDescription('The URL of the song to play')
            .setRequired(true)),
    execute: play,
};
