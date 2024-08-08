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
            console.log(`❕Configuration not found for server ${guildId}.`);
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
            console.log('Unable to read welcome banner file', error);
        }

        if (welcomeChannel) {
            try {
                const embed = new EmbedBuilder()
                    .setTitle(`welcome ${member.user.tag} Join server!`)
                    .setDescription(`${member.user.toString()} Welcome!`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png', size: 256 }));
                
                if (bannerBuffer) {
                    await welcomeChannel.send({ embeds: [embed], files: [new AttachmentBuilder(bannerBuffer, 'welcome-banner.png')] });
                } else {
                    await welcomeChannel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error('An error occurred while sending the welcome message or banner:', error);
            }
        } else {
            console.log('❕Welcome channel not found.');
        }
    });

    // 用戶離開伺服器訊息
    client.on('guildMemberRemove', async member => {
        const guildId = member.guild.id;
        const guildConfig = config[guildId];
        
        if (!guildConfig) {
            console.log(`❕Configuration not found for server ${guildId}.`);
            return;
        }

        const leaveChannelID = guildConfig.leaveChannelID;
        const leaveChannel = client.channels.cache.get(leaveChannelID);

        if (leaveChannel) {
            try {
                await leaveChannel.send(`**${member.user.tag}** Left the server.`);
            } catch (error) {
                console.error('An error occurred while sending away message:', error);
            }
        } else {
            console.log('❕Leave channel not found.');
        }
    });
}

export { guildMember };