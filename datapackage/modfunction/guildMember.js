import fs from 'fs';
import path from 'path';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, 'guildMember.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function guildMember(client) {
    // 用戶加入伺服器訊息
    client.on('guildMemberAdd', async member => {
        const guildId = member.guild.id;
        const guildConfig = config[guildId];
        
        if (!guildConfig) {
            console.log(`未找到伺服器 ${guildId} 的配置。`);
            return;
        }

        const welcomeChannelID = guildConfig.welcomeChannelID;
        const welcomeBannerPath = path.join(__dirname, 'welcome-banner.png');
        const welcomeChannel = client.channels.cache.get(welcomeChannelID);

        // 讀取檔案內容為 Buffer
        let bannerBuffer;
        try {
            bannerBuffer = await fs.promises.readFile(welcomeBannerPath);
        } catch (error) {
            console.log('無法讀取歡迎橫幅檔案。', error);
        }

        if (welcomeChannel) {
            try {
                const embed = new EmbedBuilder()
                    .setTitle(`歡迎 ${member.user.tag} 加入我們的伺服器！`)
                    .setDescription(`${member.user.toString()} 歡迎你！`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png', size: 256 }));
                
                if (bannerBuffer) {
                    await welcomeChannel.send({ embeds: [embed], files: [new AttachmentBuilder(bannerBuffer, 'welcome-banner.png')] });
                } else {
                    await welcomeChannel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error('發送歡迎消息或橫幅時出現錯誤：', error);
            }
        } else {
            console.log('未找到歡迎頻道。');
        }
    });

    // 用戶離開伺服器訊息
    client.on('guildMemberRemove', async member => {
        const guildId = member.guild.id;
        const guildConfig = config[guildId];
        
        if (!guildConfig) {
            console.log(`未找到伺服器 ${guildId} 的配置。`);
            return;
        }

        const leaveChannelID = guildConfig.leaveChannelID;
        const leaveChannel = client.channels.cache.get(leaveChannelID);

        if (leaveChannel) {
            try {
                await leaveChannel.send(`**${member.user.tag}** 離開了伺服器。`);
            } catch (error) {
                console.error('發送離開消息時出現錯誤：', error);
            }
        } else {
            console.log('未找到離開頻道。');
        }
    });
}

export { guildMember };