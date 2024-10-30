import fs from 'fs';
import path from 'path';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GuildMembers {
    constructor(client) {
        this.client = client;
        this.configPath = path.resolve(__dirname, 'guildMember.json');
        this.config = this.loadConfig();
        
        // 綁定事件處理器
        this.registerEvents();
    }

    // 加載配置文件
    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('Error loading guildMember.json configuration:', error);
            return {}; // 設置默認值以防錯誤
        }
    }

    // 綁定事件
    registerEvents() {
        // 移除已存在的事件監聽器以防止重複綁定
        this.client.removeAllListeners('guildMemberAdd');
        this.client.removeAllListeners('guildMemberRemove');
        
        // 新增 `guildMemberAdd` 事件監聽器
        this.client.on('guildMemberAdd', async (member) => {
            try {
                await this.handleGuildMemberAdd(member);
            } catch (error) {
                console.error('An error occurred in guildMemberAdd event:', error);
            }
        });
        
        // 新增 `guildMemberRemove` 事件監聽器
        this.client.on('guildMemberRemove', async (member) => {
            try {
                await this.handleGuildMemberRemove(member);
            } catch (error) {
                console.error('An error occurred in guildMemberRemove event:', error);
            }
        });
    }

    // 處理成員加入
    async handleGuildMemberAdd(member) {
        const guildId = member.guild.id;
        const guildConfig = this.config[guildId];

        console.log(`guildId: ${guildId}, guildConfig: ${guildConfig}`);

        if (!guildConfig) {
            console.log(`❕Configuration not found for server ${guildId}.`);
            return;
        }

        const welcomeChannelID = guildConfig.welcomeChannelID;
        const welcomeChannel = this.client.channels.cache.get(welcomeChannelID);
        const welcomeBannerPath = path.join(__dirname, 'welcome-banner.png');

        if (!welcomeChannel) {
            console.log('❕Welcome channel not found.');
            return;
        }

        let bannerBuffer;
        try {
            bannerBuffer = await fs.promises.readFile(welcomeBannerPath);
        } catch (error) {
            console.log('Unable to read welcome banner file', error);
        }

        const embed = new EmbedBuilder()
            .setTitle(`Welcome ${member.user.tag} to the server!`)
            .setDescription(`${member.user.toString()} Welcome!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: 'png', size: 256 }));

        const messageOptions = { embeds: [embed] };
        if (bannerBuffer) {
            messageOptions.files = [new AttachmentBuilder(bannerBuffer, 'welcome-banner.png')];
        }

        try {
            await welcomeChannel.send(messageOptions);
        } catch (error) {
            console.error('An error occurred while sending the welcome message or banner:', error);
        }
    }

    // 處理成員離開
    async handleGuildMemberRemove(member) {
        const guildId = member.guild.id;
        const guildConfig = this.config[guildId];

        if (!guildConfig) {
            console.log(`❕Configuration not found for server ${guildId}.`);
            return;
        }

        const leaveChannelID = guildConfig.leaveChannelID;
        const leaveChannel = this.client.channels.cache.get(leaveChannelID);

        if (!leaveChannel) {
            console.log('❕Leave channel not found.');
            return;
        }

        try {
            await leaveChannel.send(`**${member.user.tag}** has left the server.`);
        } catch (error) {
            console.error('An error occurred while sending the leave message:', error);
        }
    }
}

export { GuildMembers };