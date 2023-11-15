import { createAudioPlayer, createAudioResource, joinVoiceChannel, demuxProbe } from '@discordjs/voice';
import ytdl from 'ytdl-core';

import fs from 'fs'; // 导入fs模块

let playlists = new Map();

const savePlaylists = () => {
    const jsonObject = Object.fromEntries(playlists.entries());
    fs.writeFileSync('playlists.json', JSON.stringify(jsonObject));
};

const loadPlaylists = () => {
    if (fs.existsSync('playlists.json')) {
        try {
            const data = fs.readFileSync('playlists.json', 'utf-8');
            playlists = new Map(Object.entries(JSON.parse(data)));
        } catch (err) {
            console.error('Failed to parse playlists.json:', err);
        }
    }
};

const removeSong = (guildId, songUrl) => {
    const playlist = playlists.get(guildId);
    if (!playlist) {
        throw new Error('No playlist for this guild.');
    }

    const songIndex = playlist.indexOf(songUrl);
    if (songIndex === -1) {
        throw new Error('Song not found in playlist.');
    }

    playlist.splice(songIndex, 1);
    savePlaylists();
};

const addSong = (guildId, songUrl) => {
    if (!playlists.has(guildId)) {
        playlists.set(guildId, []);
    }
    playlists.get(guildId).push(songUrl);
    savePlaylists();
};

const getNextSong = (guildId) => {
    const playlist = playlists.get(guildId);
    return playlist ? playlist[0] : null;
};

const getPlaylist = (guildId) => {
    return playlists.get(guildId);
};

loadPlaylists();

const player = createAudioPlayer(); // 创建全局的音频播放器
let connection = null; // 这里依然使用 let，因为需要在 skipToNextSong 中重新赋值

const createVoiceConnection = interaction => {
    const channelId = interaction.member.voice.channelId;
    const channel = interaction.guild.channels.resolve(channelId);

    if (!channel) {
        throw new Error('您需要先加入一个语音频道！');
    }

    return joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
};

const createStream = songUrl => {
    return ytdl(songUrl, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25, // 32MB
    });
};

const createResource = async stream => {
    const { stream: outputStream, type } = await demuxProbe(stream);
    return createAudioResource(outputStream, {
        inputType: type,
        channels: 2,
        inlineVolume: true,
    });
};

const playNextSong = async (interaction, connection) => {
    if (!interaction.member.voice.channelId) {
        throw new Error('You need to join a voice channel first!');
    }

    const songUrl = getNextSong(interaction.guild.id);
    if (!songUrl) {
        throw new Error('播放列表为空。');
    }

    if (!connection) {
        connection = createVoiceConnection(interaction);
        connection.subscribe(player);
    }

    const stream = createStream(songUrl);
    const resource = await createResource(stream);

    player.play(resource);

    player.on('error', error => {
        console.error(`音频播放器错误：${error.message}`);
    });

    await waitForIdleAndPlayNextSong(interaction, connection, songUrl);
};

const waitForIdleAndPlayNextSong = async (interaction, connection, songUrl) => {
    await new Promise(resolve => {
        player.on('idle', () => {
            if (player.state.status !== 'idle') {
                player.stop();
            }
            connection.destroy();
            removeSong(interaction.guild.id, songUrl);
            resolve();
        });
    });

    await playNextSong(interaction, null); // 传递 null 以创建新的音频连接
};

const skipToNextSong = async interaction => {
    // 停止播放并清理资源
    if (player.state.status !== 'idle') {
        player.stop();
    }
    if (connection) {
        connection.disconnect();
        connection = null;
    }
    await playNextSong(interaction);
};

export {
    playNextSong,
    skipToNextSong,
    removeSong,
    addSong,
    getNextSong,
    getPlaylist,
    waitForIdleAndPlayNextSong,
};
