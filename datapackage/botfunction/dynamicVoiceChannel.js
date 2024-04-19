import dotenv from 'dotenv'
import { PermissionsBitField } from 'discord.js'
dotenv.config()

function dynamicvoicechannel(client) {
    // 監聽語音狀態更新事件
    client.on('voiceStateUpdate', async (oldState, newState) => {
        // 從環境變量中獲取設定的觸發頻道ID
        const triggerChannelId = process.env.autovoicechannelID

        // 檢查是否為加入指定的觸發頻道
        if (newState.channelId === triggerChannelId) {
            const member = newState.member;
            const guild = newState.guild;

            // 處理用戶名，確保不為空並移除非法字符
            let channelName = member.user.username.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "");
            if (!channelName) channelName = 'Default Channel';

            console.log(`Creating a channel with name: ${channelName}`); // 打印用於調試的信息

            try {
                // 創建一個新的語音頻道，並設定相應的權限覆蓋
                const channel = await guild.channels.create({
                    name: `${channelName}'s Channel`,
                    type: 2, // 2 表示語音頻道
                    parent: newState.channel.parentId,
                    permissionOverwrites: [
                        {
                            id: member.id,  // 授予創建者完全控制權限
                            allow: [
                                PermissionsBitField.Flags.ManageChannels,
                                PermissionsBitField.Flags.MoveMembers,
                                PermissionsBitField.Flags.MuteMembers,
                                PermissionsBitField.Flags.DeafenMembers
                            ]
                        }
                    ]
                })

                console.log(`Channel created: ${channel.name}`);
                await member.voice.setChannel(channel); // 將用戶移動到新創建的頻道
                console.log(`Member moved to new channel.`);

                // 創建一個收集器，用於監控頻道是否空置，如果空置則刪除頻道
                const filter = (state) => state.channelId === channel.id && state.channel.members.size === 0;
                const collector = guild.voiceStates.createCollector({ filter, time: 300000 }); // 設置為5分鐘後自動停止

                collector.on('collect', async () => {
                    if (channel.members.size === 0) {
                        await channel.delete();
                        console.log(`Channel deleted.`);
                        collector.stop();
                    }
                });

                collector.on('end', async () => {
                    if (!channel.deleted && channel.members.size === 0) {
                        await channel.delete();
                        console.log(`Channel deleted after collector ended.`);
                    }
                });

            } catch (error) {
                console.error('Failed to create the channel:', error);
            }
        }

        // 如果用戶離開了之前由他創建的空的語音頻道，則刪除該頻道
        if (oldState.channelId && oldState.channelId !== triggerChannelId && oldState.channel.members.size === 0) {
            const channel = oldState.channel;
            if (channel.name.startsWith(oldState.member.user.username)) {
                console.log(`Deleting empty channel created by user.`);
                await channel.delete();
            }
        }
    });       
}

export {
    dynamicvoicechannel,
}
