import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    demuxProbe,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import fs from 'fs';

// 全局變數，存儲各伺服器的播放列表
let playlists = new Map();

// 播放列表文件路徑
const playlistPath = 'datapackge/musicfunction/playlists.json';

// 將播放列表保存到文件的函數
const savePlaylists = () => {
    const jsonObject = Object.fromEntries(playlists.entries());
    fs.writeFileSync(playlistPath, JSON.stringify(jsonObject));
};

// 從文件中加載播放列表的函數
const loadPlaylists = () => {
    if (fs.existsSync(playlistPath)) {
        try {
            const data = fs.readFileSync(playlistPath, 'utf-8');
            playlists = new Map(Object.entries(JSON.parse(data)));
        } catch (err) {
            console.error('Failed to parse playlists.json:', err);
        }
    }
};

// 从播放列表中移除歌曲的函數
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

// 向播放列表中添加歌曲的函數
const addSong = (guildId, songUrl) => {
    playlists.set(guildId, playlists.get(guildId) || []);
    playlists.get(guildId).push(songUrl);
    savePlaylists();
};

// 獲取下一首歌曲的函數
const getNextSong = (guildId) => (playlists.get(guildId) || [])[0];

// 獲取整個播放列表的函數
const getPlaylist = (guildId) => playlists.get(guildId) || [];

// 從文件加載播放列表
loadPlaylists();

// 創建全局的音頻播放器
const player = createAudioPlayer();
let connection = null;

// 創建音頻連接的函數
const createVoiceConnection = (interaction) => {
    const { guildId, member } = interaction;
    const voiceChannel = member?.voice?.channelId;
    const adapterCreator = interaction.guild.voiceAdapterCreator;

    if (!voiceChannel) {
        throw new Error('您需要先加入一个语音频道！');
    }

    return joinVoiceChannel({
        channelId: voiceChannel,
        guildId: guildId,
        adapterCreator: adapterCreator,
    });
};

// 創建音頻流的函數
const createStream = (songUrl) =>
    ytdl(songUrl, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }
);

// 創建音頻資源的函數
const createResource = async (stream) => {
    const { stream: outputStream, type } = await demuxProbe(stream);
    return createAudioResource(outputStream, { inputType: type, channels: 2, inlineVolume: true });
};

// 播放下一首歌曲的函數
const playNextSong = async (interaction, connection) => {
    try {
        const voiceChannelId = interaction.member?.voice.channelId;
        if (!voiceChannelId) {
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

        player.on('error', (error) => {
            console.error(`音频播放器错误：${error.message}`);
        });

        await waitForIdleAndPlayNextSong(interaction, connection, songUrl);
    } catch (error) {
        if (error.message === '播放列表为空。') {
            console.log('播放列表为空，請使用 /add 添加歌曲。');
        } else {
            handleCommandError(interaction, error);
        }
    }
};

// 等待播放器空閒並播放下一首歌曲的函數
const waitForIdleAndPlayNextSong = async (interaction, connection, songUrl) => {
    await new Promise((resolve) => {
        player.once('idle', () => {
            if (player.state.status !== 'idle') {
                player.stop();
            }
            connection.destroy();
            removeSong(interaction.guild.id, songUrl);
            resolve();
        });
    });

    await playNextSong(interaction, null);
};

// 跳過到下一首歌曲的函數
const skipToNextSong = async (interaction) => {
    if (player.state.status !== 'idle') {
        player.stop();
    }
    if (connection) {
        connection.disconnect();
        connection = null;
    }
    await playNextSong(interaction);
};

// 新的錯誤處理函數
const handleCommandError = (interaction, error) => {
    console.error(`Command error: ${error.message}`);
    interaction.reply(`指令执行失败: ${error.message}`);
};

export {
    playNextSong,
    skipToNextSong,
    removeSong,
    addSong,
    getNextSong,
    getPlaylist,
    waitForIdleAndPlayNextSong,
    createVoiceConnection
};