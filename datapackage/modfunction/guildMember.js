import fs from 'fs';
import path from 'path';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { fileURLToPath } from 'node:url';

class GuildMembers {
    constructor() {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = path.dirname(this.__filename);
        this.configPath = path.resolve(this.__dirname, 'guildMember.json');

        try {
            this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('Error loading guildMember.json configuration:', error);
            this.config = {}; // 設置默認值以防錯誤
        }
        
        this.eventsRegistered = false; // 防止多次事件綁定
    }

    guildMember(client) {
        if (this.eventsRegistered) return; // 如果事件已註冊，則返回以防止重複綁定

        client.on('guildMemberAdd', async (member) => {
            try {
                await this.handleGuildMemberAdd(client, member);
            } catch (error) {
                console.error('An error occurred in guildMemberAdd event:', error);
            }
        });

        client.on('guildMemberRemove', async (member) => {
            try {
                await this.handleGuildMemberRemove(client, member);
            } catch (error) {
                console.error('An error occurred in guildMemberRemove event:', error);
            }
        });

        this.eventsRegistered = true; // 標記事件已綁定
    }

    async handleGuildMemberAdd(client, member) {
        const guildId = member.guild.id;
        const guildConfig = this.config[guildId];

        console.log(`guildId: ${guildId}, guildConfig: ${guildConfig}`);

        if (!guildConfig) {
            console.log(`❕Configuration not found for server ${guildId}.`);
            return;
        }

        const welcomeChannelID = guildConfig.welcomeChannelID;
        const welcomeChannel = client.channels.cache.get(welcomeChannelID);
        const welcomeBannerPath = path.join(this.__dirname, 'welcome-banner.png');

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

    async handleGuildMemberRemove(client, member) {
        const guildId = member.guild.id;
        const guildConfig = this.config[guildId];

        if (!guildConfig) {
            console.log(`❕Configuration not found for server ${guildId}.`);
            return;
        }

        const leaveChannelID = guildConfig.leaveChannelID;
        const leaveChannel = client.channels.cache.get(leaveChannelID);

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