// 引入 dotenv 模組，用於載入環境變數
import dotenv from 'dotenv';
dotenv.config();

// 引入所需的模組
import fs from 'fs';
import path from 'path';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js'

function guildMember(client){
//用戶加入伺服器訊息
client.on('guildMemberAdd', async member => {
    const welcomeChannelID = process.env.welcomeChannelID;
    const welcomeBannerPath = path.join(__dirname, 'welcome-banner.png');
    const welcomeChannel = client.channels.cache.get(welcomeChannelID);
    // 讀取檔案內容為 Buffer
    const bannerBuffer = await fs.promises.readFile(welcomeBannerPath);

    if (welcomeChannel) {
        try {
            // 建立一個 EmbedBuilder
            const embed = new EmbedBuilder()
                .setTitle(`歡迎 ${member.user.tag} 加入我們的伺服器！`)
                .setDescription(`${member.user.toString()}真是機車🛵歡迎你！`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png', size: 256 }));

            if (!bannerBuffer) {
                console.log('未找到歡迎橫幅。');
                // 在歡迎消息中添加一個 EmbedBuilder
                welcomeChannel.send({ embeds: [embed]});
            }else{
                // 在歡迎消息中添加一個 EmbedBuilder
                welcomeChannel.send({ embeds: [embed], files: [new AttachmentBuilder(bannerBuffer, 'welcome-banner.png')] });
            }
        } catch (error) {
            console.error('發送歡迎消息或橫幅時出現錯誤：', error);
        }
    } else {
        console.log('未找到歡迎頻道。');
    }
});

//用戶離開伺服器訊息
client.on('guildMemberRemove', member => {
    const leaveChannelID = process.env.leaveChannelID; // 請更換為你的目標頻道的ID
    const leaveChannel = member.guild.channels.cache.get(leaveChannelID);

    if (leaveChannel) {
        try {
            // 直接發送一條文本消息
            leaveChannel.send(`**${member.user.tag}** 離開了伺服器。`);
        } catch (error) {
            console.error('發送離開消息時出現錯誤：', error);
        }
    } else {
        console.log('未找到離開頻道。');
    }
});
}

export {
    guildMember
}