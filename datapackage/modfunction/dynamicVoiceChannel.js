import fs from 'fs';
import path from 'path';
import { PermissionsBitField } from 'discord.js';

// 獲取當前檔案的路徑
const __dirname = path.dirname(new URL(import.meta.url).pathname);

function dynamicvoicechannel(client) {
    // 讀取 JSON 檔案
    const configPath = path.resolve(__dirname, 'dynamicvoicechannel.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const serverTrackingChannels = config;

    // 監聽成員加入或離開語音頻道的事件
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const guild = newState.guild;
        const triggerChannelId = serverTrackingChannels[guild.id];

        // 檢查是否有成員加入了指定的語音頻道
        if (triggerChannelId && newState.channelId === triggerChannelId) {
            const member = newState.member;
            let channelName = member.user.username.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "");
            if (!channelName) channelName = 'Default Channel';

            try {
                // 創建新的語音頻道
                const channel = await guild.channels.create({
                    name: `${channelName}'s Channel`,
                    type: 2, // 2 = 語音頻道
                    parent: newState.channel.parentId,
                    permissionOverwrites: [{
                        id: member.id,
                        allow: [
                            PermissionsBitField.Flags.ManageChannels,
                            PermissionsBitField.Flags.MoveMembers,
                            PermissionsBitField.Flags.MuteMembers,
                            PermissionsBitField.Flags.DeafenMembers
                        ]
                    }]
                });

                await member.voice.setChannel(channel); // 将用户移动到新创建的频道

            } catch (error) {
                console.error('Failed to create the channel:', error);
            }
        }

        // 檢查是否有成員離開了語音頻道
        if (oldState.channel && oldState.channel.members.size === 0) {
            if (oldState.channel.name.includes("'s Channel")) {
                await oldState.channel.delete(); // 删除空的语音频道
            }
        }
    });
}

export {
    dynamicvoicechannel,
};