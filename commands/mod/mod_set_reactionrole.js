import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { setup } from '../../main.js';

// 獲取當前檔案的路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../datapackage/modfunction/messageReaction.json');

// 讀取 JSON 檔案
function loadConfig() {
    console.log(`Loading config from: ${configPath}`); // 调试路径
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return {};
    }
}

// 寫入 JSON 檔案
function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
}

// 定義 slash 指令的資料
export const data = new SlashCommandBuilder()
    .setName('mod_set_reactionrole')
    .setDescription('Set a role to be assigned when a reaction is added to a message')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel where the message is located')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('messageid')
            .setDescription('The ID of the message to monitor')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('emoji')
            .setDescription('The emoji to react with')
            .setRequired(true)
    )
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('The role to be assigned')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

// 定義執行 slash 指令的函數
export const execute = async (interaction) => {
    const channel = interaction.options.getChannel('channel');
    const messageId = interaction.options.getString('messageid');
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');

    // 確認選擇的頻道是文字頻道
    if (channel.type == ChannelType.GuildVoice) {
        return interaction.reply('The selected channel is not a text channel.');
    }

    const guildId = interaction.guild.id;
    const config = loadConfig();
    
    if (!config[guildId]) {
        config[guildId] = {};
    }
    
    if (!config[guildId][messageId]) {
        config[guildId][messageId] = {};
    }

    const emojiName = extractEmojiName(emoji);

    // 設定反應角色
    config[guildId][messageId][emojiName] = role.id;
    saveConfig(config);

    await interaction.reply(`Reaction role set: Message ID ${messageId}, Emoji ${emoji}, Role ${role.name}`);

    setup();
};

/**
 * 提取 emoji 名称，过滤掉 ID
 * @param {string} emoji - 表情符号的字符串，可能是 `<:name:id>` 或 Unicode 表情符号
 * @returns {string} - 表情符号的名称
 */
function extractEmojiName(emoji) {
    // 自定义表情符号格式：<:name:id>
    const customEmojiRegex = /^<:(.+?):\d+>$/;
    const match = emoji.match(customEmojiRegex);
    if (match) {
        return match[1]; // 返回名称部分
    }
    // 对于 Unicode 表情符号，直接返回
    return emoji;
}