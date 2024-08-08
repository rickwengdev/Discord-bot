import { createAudioPlayer, createAudioResource, joinVoiceChannel, demuxProbe, getVoiceConnection } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv'
import ytdl from '@distube/ytdl-core';
import fs from 'fs';

dotenv.config();

let playlists = new Map();
const playlistPath = 'datapackage/musicfunction/playlists.json';

// 保存播放列表到文件的函数
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
            console.error('Failed to parse playlist:', err);
        }
    }
};

const errorhandler = (error) => {
    console.error('An error occurred:', error);
};

// 音樂播放器類
class MusicPlayer {
    constructor(guildId) {
        this.guildId = guildId;
        this.player = createAudioPlayer();
        this.songUrl = undefined;

        this.loadPlaylists();
    }

    // 加載播放列表
    loadPlaylists() {
        if (!playlists.has(this.guildId)) {
            playlists.set(this.guildId, []);
        }
    }

    // 添加歌曲到播放列表
    addSong(songUrl) {
        const playlist = playlists.get(this.guildId) || [];
        playlist.push(songUrl);
        playlists.set(this.guildId, playlist);
        savePlaylists();
    }

    // 獲取下一首歌曲
    getNextSong() {
        return (playlists.get(this.guildId) || [])[0];
    }

    // 獲取播放列表
    getPlaylist() {
        return (playlists.get(this.guildId) || []);
    }

    // 從播放列表中刪除歌曲
    removeSong(songUrl) {
        const playlist = playlists.get(this.guildId);

        if (!playlist || playlist.length === 0) {
            console.log('The playlist is empty and songs cannot be deleted.');
            return;
        }

        const songIndex = playlist.indexOf(songUrl);
        if (songIndex === -1) {
            console.log('Song not found in playlist.');
            return;
        }

        playlist.splice(songIndex, 1);
        savePlaylists();
    }

    // 創建音頻流
    createStream(songUrl) {
        console.log(`Create audio stream：${songUrl}`);
        return ytdl(songUrl, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
    }

    // 創建音頻資源
    async createResource(stream) {
        const { stream: outputStream, type } = await demuxProbe(stream);
        return createAudioResource(outputStream, { inputType: type, channels: 2, inlineVolume: true });
    }

    // 播放歌曲
    async playSong(interaction) {
        try {
            const voiceChannelId = interaction.member?.voice.channelId;
            if (!voiceChannelId) {
                interaction.editReply('You need to join a voice channel first!');
            }

            this.songUrl = this.getNextSong();
            if (!this.songUrl) {
                interaction.editReply('The playlist is empty.');
                return;
            }

            const info = await ytdl.getBasicInfo(this.songUrl, { agent });
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(info.videoDetails.title)
                .setDescription(info.videoDetails.description.length > 200 ? info.videoDetails.description.slice(0, 197) + '...' : info.videoDetails.description)
                .setThumbnail(info.videoDetails.thumbnails[0].url);

            interaction.editReply({ content: 'Now playing song:', embeds: [embed] });

            let connection = getVoiceConnection(interaction.guild.id);
            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: voiceChannelId,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                connection.subscribe(this.player);
            }

            const stream = this.createStream(this.songUrl);
            const resource = await this.createResource(stream);

            console.log(`Play audio：${this.songUrl}`);
            this.player.play(resource);

            await this.waitForIdleAndPlayNextSong(interaction);
        } catch (error) {
            errorhandler(error);
        }
    }

    // 等待播放器空閒並播放下一首歌曲
    async waitForIdleAndPlayNextSong(interaction) {
        await new Promise((resolve) => {
            this.player.once('idle', () => {
                console.log('The player is idle and plays the next song.');
                if (this.songUrl !== undefined && this.player.state.status === 'idle') {
                    this.removeSong(this.songUrl);
                    this.songUrl = this.getNextSong();
                }
                resolve();
                if (this.songUrl) {
                    this.playNextSong(interaction);
                } else {
                    setTimeout(() => {
                        if (this.player.state.status === 'idle' && (playlists.get(interaction.guild.id) || []).length === 0) {
                            console.log('The playlist is empty and the voice connection is disconnected.');
                            this.stopPlaying(interaction);
                        }
                    }, 5 * 60 * 1000);
                }
            });
        });
    }

    // 跳過播放下一首歌曲
    skipToNextSong() {
        if (this.player.state.status !== 'idle') {
            this.player.stop();
        }
    }

    // 停止播放
    stopPlaying(interaction) {
        if (this.songUrl !== undefined) {
            this.removeSong(this.songUrl);
            this.songUrl = undefined;
        }
        if (this.player.state.status !== 'idle') {
            this.player.stop();
        }
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            connection.destroy();
        }
        console.log(`User ${interaction.user.username} has stopped playing.`);
    }
}

const musicPlayers = new Map();

const getMusicPlayer = (guildId) => {
    if (!musicPlayers.has(guildId)) {
        musicPlayers.set(guildId, new MusicPlayer(guildId));
    }
    return musicPlayers.get(guildId);
};

loadPlaylists();

export {
    errorhandler,
    getMusicPlayer,
    agent,
}