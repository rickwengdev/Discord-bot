// 引入 Discord.js 相關模組
import { createAudioPlayer, createAudioResource, joinVoiceChannel, demuxProbe } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import fs from 'fs';

// 全域變數，儲存各伺服器的播放列表
let playlists = new Map();

// 播放列表檔案路徑
const playlistPath = 'datapackge/musicfunction/playlists.json';

// 將播放列表保存到檔案的函數
const savePlaylists = () => {
    const jsonObject = Object.fromEntries(playlists.entries());
    fs.writeFileSync(playlistPath, JSON.stringify(jsonObject));
};

// 從檔案中載入播放列表的函數
const loadPlaylists = () => {
    if (fs.existsSync(playlistPath)) {
        try {
            const data = fs.readFileSync(playlistPath, 'utf-8');
            playlists = new Map(Object.entries(JSON.parse(data)));
        } catch (err) {
            console.error('解析 playlists.json 檔案失敗:', err);
        }
    }
};

// 從播放列表中移除歌曲的函數
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

// 從檔案載入播放列表
loadPlaylists();

// 創建全域的音訊播放器
const player = createAudioPlayer();
let connection = null;
let songUrl = undefined;

// 創建音訊連接的函數
const createVoiceConnection = (interaction) => {
    const { guildId, member } = interaction;
    const voiceChannel = member?.voice?.channelId;
    const adapterCreator = interaction.guild.voiceAdapterCreator;

    if (!voiceChannel) {
        throw new Error('您需要先加入一個語音頻道！');
    }

    connection = joinVoiceChannel({
        channelId: voiceChannel,
        guildId: guildId,
        adapterCreator: adapterCreator,
    });

    return connection;
};

// 創建音訊串流的函數
const createStream = (songUrl) => ytdl(songUrl, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });

// 創建音訊資源的函數
const createResource = async (stream) => {
    const { stream: outputStream, type } = await demuxProbe(stream);
    return createAudioResource(outputStream, { inputType: type, channels: 2, inlineVolume: true });
};

// 播放下一首歌曲的函數
const playNextSong = async (interaction) => {
    try {
        const voiceChannelId = interaction.member?.voice.channelId;
        if (!voiceChannelId) {
            throw new Error('您需要先加入一個語音頻道！');
        }

        const guildId = interaction.guild.id;
        songUrl = getNextSong(guildId);
        if (songUrl === undefined) {
            throw new Error('播放列表為空。');
        }
        
        // 在添加新的錯誤監聽器之前手動移除舊的監聽器
        player.off('error', handlePlayerError);

        if (!connection) {
            connection = createVoiceConnection(interaction);
            connection.subscribe(player);
        }

        const stream = createStream(songUrl);
        const resource = await createResource(stream);

        player.play(resource);

        player.on('error', (error) => {
            console.error(`音訊播放器錯誤：${error.message}`);
        });

        await waitForIdleAndPlayNextSong(interaction);
    } catch (error) {
        if (error.message === '播放列表為空。') {
            console.log('播放列表為空，等待新歌曲加入。');
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
                }, 5 * 60 * 1000); // 5 分鐘的毫秒數
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
    console.error(`指令錯誤: ${error.message}`);
    interaction.reply({ content: `指令執行失敗: ${error.message}`, ephemeral: true });
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
