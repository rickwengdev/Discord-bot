import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';

// 获取当前模块的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../datapackage/modfunction/messageReaction.json');

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return {};
    }
}

function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
}

export const data = new SlashCommandBuilder()
    .setName('mod_set_reactionrole')
    .setDescription('Set a role to be assigned when a reaction is added to a message')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel where the message is located')
            .setRequired(true)
            .addChannelTypes(0) // Use ChannelType(0 = text) for v14+
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

export const execute = async (interaction) => {
    const channel = interaction.options.getChannel('channel');
    const messageId = interaction.options.getString('messageid');
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');

    // Ensure the channel is a text channel
    if (channel.type !== ChannelType.GuildText) {
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

    // Add or update the emoji-role mapping
    config[guildId][messageId][emoji] = role.id;
    saveConfig(config);

    await interaction.reply(`Reaction role set: Message ID ${messageId}, Emoji ${emoji}, Role ${role.name}`);
};