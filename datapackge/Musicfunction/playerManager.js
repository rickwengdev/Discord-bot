import { createAudioPlayer, createAudioResource, joinVoiceChannel, demuxProbe } from '@discordjs/voice';
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
    if (!playlist || playlist.length === 0) {
        throw new Error('播放清單為空，無法刪除歌曲。');
    }

    const songIndex = playlist.indexOf(songUrl);
    if (songIndex === -1) {
        throw new Error('歌曲未在播放清單中找到。');
    }

    playlist.splice(songIndex, 1);
    savePlaylists();
};

// 向播放列表中添加歌曲的函數
const addSong = (guildId, songUrl) => {
    const playlist = playlists.get(guildId) || [];
    playlist.push(songUrl);
    playlists.set(guildId, playlist);
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
let songUrl = undefined;

// 創建音頻連接的函數
const createVoiceConnection = (interaction) => {
    const { guildId, member } = interaction;
    const voiceChannel = member?.voice?.channelId;
    const adapterCreator = interaction.guild.voiceAdapterCreator;

    if (!voiceChannel) {
        throw new Error('您需要先加入一个语音频道！');
    }

    connection = joinVoiceChannel({
        channelId: voiceChannel,
        guildId: guildId,
        adapterCreator: adapterCreator,
    });

    return connection;
};

// 創建音頻流的函數
const createStream = (songUrl) => ytdl(songUrl, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });

// 創建音頻資源的函數
const createResource = async (stream) => {
    const { stream: outputStream, type } = await demuxProbe(stream);
    return createAudioResource(outputStream, { inputType: type, channels: 2, inlineVolume: true });
};

// 播放下一首歌曲的函數
const playNextSong = async (interaction) => {
    try {
        const voiceChannelId = interaction.member?.voice.channelId;
        if (!voiceChannelId) {
            throw new Error('您需要先加入一个语音频道！');
        }

        const guildId = interaction.guild.id;
        songUrl = getNextSong(guildId);
        if (songUrl === undefined) {
            throw new Error('播放列表为空。');
        }
        
        // 在添加新的错误监听器之前手动移除旧的监听器
        player.off('error', handlePlayerError);

        if (!connection) {
            connection = createVoiceConnection(interaction);
            connection.subscribe(player);
        }

        const stream = createStream(songUrl);
        const resource = await createResource(stream);

        player.play(resource);

        // await interaction.reply(`正在播放：${songUrl}`);

        player.on('error', (error) => {
            console.error(`音频播放器错误：${error.message}`);
        });

        await waitForIdleAndPlayNextSong(interaction);
    } catch (error) {
        if (error.message === '播放列表为空。') {
            console.log('播放列表为空，等待新歌曲加入。');
        } else {
            handleCommandError(interaction, error);
        }
    }
};

// 等待播放器空閒並播放下一首歌曲的函數
const waitForIdleAndPlayNextSong = async (interaction) => {
    await new Promise((resolve) => {
        player.once('idle', () => {
            if (player.state.status !== 'idle') {
                player.stop();
            }
            if (songUrl !== undefined && player.state.status === 'idle') {
                removeSong(interaction.guild.id, songUrl);
            }
            resolve();
            if (songUrl !== undefined) {
                playNextSong(interaction);
            } else {
                setTimeout(() => {
                    if (player.state.status === 'idle' && connection) {
                        connection.destroy();
                    }
                }, 5 * 60 * 1000); // 5 分钟的毫秒数
            }
        });
    });
};

// 跳過到下一首歌曲的函數
const skipToNextSong = async () => {
    if (player.state.status !== 'idle') {
        player.stop();
    }
};

// 停止播放的函數
const stopPlaying = async (interaction) => {
    try {
        if (songUrl !== undefined) {
            removeSong(interaction.guild.id, songUrl);
            songUrl = undefined;
        }
        if (connection) {
            connection.destroy();
            connection = null;
        }
        if (player.state.status !== 'idle') {
            player.stop();
        }
        await interaction.reply('已停止播放。');
    } catch (error) {
        handleCommandError(interaction, error);
    }
};

// 新的錯誤處理函數
const handleCommandError = (interaction, error) => {
    console.error(`指令错误: ${error.message}`);
    interaction.reply({ content: `指令执行失败: ${error.message}`, ephemeral: true });
};

export {
    playNextSong,
    skipToNextSong,
    removeSong,
    addSong,
    getNextSong,
    getPlaylist,
    waitForIdleAndPlayNextSong,
    createVoiceConnection,
    stopPlaying,
};
