import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, 'messageReaction.json');

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return {};
    }
}

function messageReaction(client) {
    // 處理消息反應添加事件
    client.on('messageReactionAdd', async (reaction, user) => {
        const config = loadConfig();
        if (user.bot) return; // 忽略機器人反應

        const guild = reaction.message.guild;
        if (!guild) return;

        const guildId = guild.id;
        if (config[guildId]) {
            const messageReactions = config[guildId];

            // 檢查每條消息配置
            for (const [messageId, emojis] of Object.entries(messageReactions)) {
                if (reaction.message.id === messageId) {
                    const roleId = emojis[reaction.emoji.name];
                    if (roleId) {
                        const member = guild.members.cache.get(user.id);
                        const role = guild.roles.cache.get(roleId);
                        if (role) {
                            await member.roles.add(role);
                        }
                    }
                }
            }
        }
    });

    // 處理消息反應移除事件
    client.on('messageReactionRemove', async (reaction, user) => {
        const config = loadConfig();
        if (user.bot) return; // 忽略機器人反應

        const guild = reaction.message.guild;
        if (!guild) return;

        const guildId = guild.id;
        if (config[guildId]) {
            const messageReactions = config[guildId];

            // 檢查每條消息配置
            for (const [messageId, emojis] of Object.entries(messageReactions)) {
                if (reaction.message.id === messageId) {
                    const roleId = emojis[reaction.emoji.name];
                    if (roleId) {
                        const member = guild.members.cache.get(user.id);
                        const role = guild.roles.cache.get(roleId);
                        if (role) {
                            await member.roles.remove(role);
                        }
                    }
                }
            }
        }
    });
}

export {
    messageReaction
};