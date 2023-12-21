import { SlashCommandBuilder } from 'discord.js';
import { stopPlaying } from '../../datapackge/musicfunction/playerManager.js';

// 定義 slash command 的結構
export const data = new SlashCommandBuilder()
    .setName('music_stop')
    .setDescription('停止播放歌曲');

// 执行 slash command 的函數
export async function execute(interaction) {
    await stopPlaying(interaction);
}