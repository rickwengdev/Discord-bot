import dotenv from 'dotenv'
import { PermissionsBitField } from 'discord.js'
dotenv.config()

function dynamicvoicechannel(client) {
    // 監聽語音狀態更新事件
    // 監聽語音狀態更新事件
client.on('voiceStateUpdate', async (oldState, newState) => {
    const triggerChannelId = process.env.autovoicechannelID;

    // 檢查是否有成員加入觸發頻道
    if (newState.channelId === triggerChannelId) {
        const member = newState.member;
        const guild = newState.guild;
        let channelName = member.user.username.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "");
        if (!channelName) channelName = 'Default Channel';

        try {
            // 創建新的語音頻道
            const channel = await guild.channels.create({
                name: `🛵${channelName}'s Channel`,
                type: 2, // 2 表示語音頻道
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

            await member.voice.setChannel(channel); // 將用戶移動到新創建的頻道

            // 監聽新創建的頻道
            const voiceStateCollector = channel.createVoiceStateCollector({
                filter: (state) => state.channelId === channel.id
            });

            voiceStateCollector.on('collect', async (state) => {
                // 確認當前狀態是否是離開且此時頻道無其他成員
                if (state.channel && state.channel.members.size === 0) {
                    await channel.delete(); // 刪除頻道
                    voiceStateCollector.stop(); // 停止收集器
                }
            });            
        } catch (error) {
            console.error('Failed to create the channel:', error);
        }
    }

    // 檢查是否有成員離開了之前創建的語音頻道
    if (oldState.channel && oldState.channel.members.size === 0 && oldState.channelId !== triggerChannelId) {
        await oldState.channel.delete(); // 刪除空的語音頻道
    }
});
}

export {
    dynamicvoicechannel,
}
