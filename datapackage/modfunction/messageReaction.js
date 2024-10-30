import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MessageReactionHandler {
    constructor(client) {
        this.client = client;
        this.configPath = path.resolve(__dirname, 'messageReaction.json');
        this.config = this.loadConfig();

        // 初始化事件處理
        this.client.on('messageReactionAdd', this.handleReactionAdd.bind(this));
        this.client.on('messageReactionRemove', this.handleReactionRemove.bind(this));
    }

    // 加載配置文件
    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('Error reading JSON file:', error);
            return {};
        }
    }

    // 處理消息反應添加事件
    async handleReactionAdd(reaction, user) {
        if (user.bot) return; // 忽略機器人反應
        const guild = reaction.message.guild;
        if (!guild) return;

        const guildId = guild.id;
        const messageReactions = this.config[guildId];
        if (messageReactions) {
            const messageId = reaction.message.id;
            const emojiKey = reaction.emoji.id || reaction.emoji.name; // 使用 emoji ID 或 name

            const roleId = messageReactions[messageId]?.[emojiKey];
            if (roleId) {
                const member = guild.members.cache.get(user.id);
                const role = guild.roles.cache.get(roleId);
                if (member && role) {
                    await member.roles.add(role);
                }
            }
        }
    }

    // 處理消息反應移除事件
    async handleReactionRemove(reaction, user) {
        if (user.bot) return; // 忽略機器人反應
        const guild = reaction.message.guild;
        if (!guild) return;

        const guildId = guild.id;
        const messageReactions = this.config[guildId];
        if (messageReactions) {
            const messageId = reaction.message.id;
            const emojiKey = reaction.emoji.id || reaction.emoji.name; // 使用 emoji ID 或 name

            const roleId = messageReactions[messageId]?.[emojiKey];
            if (roleId) {
                const member = guild.members.cache.get(user.id);
                const role = guild.roles.cache.get(roleId);
                if (member && role) {
                    await member.roles.remove(role);
                }
            }
        }
    }
}

export { MessageReactionHandler };