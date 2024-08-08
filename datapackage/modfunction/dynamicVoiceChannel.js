import fs from 'fs';
import path from 'path';
import { PermissionsBitField } from 'discord.js';

// 获取当前目录路径
const __dirname = path.dirname(new URL(import.meta.url).pathname);

function dynamicvoicechannel(client) {
    // 读取 dynamicvoicechannel.json 文件
    const configPath = path.resolve(__dirname, 'dynamicvoicechannel.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const serverTrackingChannels = config;

    // 监听语音状态更新事件
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const guild = newState.guild;
        const triggerChannelId = serverTrackingChannels[guild.id];

        // 检查是否有成员加入触发频道
        if (triggerChannelId && newState.channelId === triggerChannelId) {
            const member = newState.member;
            let channelName = member.user.username.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "");
            if (!channelName) channelName = 'Default Channel';

            try {
                // 创建新的语音频道
                const channel = await guild.channels.create({
                    name: `${channelName}'s Channel.`,
                    type: 2, // 2 表示语音频道
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

        // 检查是否有成员离开了之前创建的语音频道
        if (oldState.channel && oldState.channel.members.size === 0) {
            if (oldState.channel.name.includes("'s Channel.")) {
                await oldState.channel.delete(); // 删除空的语音频道
            }
        }
    });
}

export {
    dynamicvoicechannel,
};