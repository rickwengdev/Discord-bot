import fs from 'fs';
import path from 'path';
import { Events } from 'discord.js';

// 獲取當前檔案的路徑
const logConfigPath = path.resolve('datapackage/modfunction/logservermessage.json');

// 讀取日志配置檔案
function loadLogConfig() {
    try {
        return JSON.parse(fs.readFileSync(logConfigPath, 'utf8'));
    } catch (error) {
        console.error('讀取 logConfig.json 錯誤:', error);
        return {};
    }
}

// 日志功能主函數
function setupLogging(client) {
    const logConfig = loadLogConfig();

    // 監聽用戶更改名字的事件
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        const guildId = newMember.guild.id;
        const logChannelId = logConfig[guildId]; // 獲取該伺服器的日志頻道ID
        if (!logChannelId) return; // 如果沒有配置日志頻道則跳過

        const logChannel = newMember.guild.channels.cache.get(logChannelId); // 獲取日志頻道
        if (!logChannel) return; // 如果日志頻道無效則跳過

        // 檢查用戶名是否改變
        if (oldMember.nickname !== newMember.nickname) {
            const oldNickname = oldMember.nickname || oldMember.user.username;
            const newNickname = newMember.nickname || newMember.user.username;
            await logChannel.send(`🔄 **${oldNickname}** 改名為 **${newNickname}**`);
        }
    });

    // 監聽用戶進出語音頻道的事件
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const guildId = newState.guild.id;
        const logChannelId = logConfig[guildId]; // 獲取該伺服器的日志頻道ID
        if (!logChannelId) return; // 如果沒有配置日志頻道則跳過

        const logChannel = newState.guild.channels.cache.get(logChannelId); // 獲取日志頻道
        if (!logChannel) return; // 如果日志頻道無效則跳過

        // 成員加入語音頻道
        if (!oldState.channel && newState.channel) {
            await logChannel.send(`🔊 **${newState.member.user.tag}** 進入了語音頻道 **${newState.channel.name}**`);
        }
        // 成員離開語音頻道
        else if (oldState.channel && !newState.channel) {
            await logChannel.send(`🔇 **${oldState.member.user.tag}** 離開了語音頻道 **${oldState.channel.name}**`);
        }
    });
}

export { setupLogging };