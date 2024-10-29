import fs from 'fs';
import path from 'path';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { setup } from '../../main.js'

// 獲取當前檔案的路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../datapackage/modfunction/guildMember.json');

// 更新 JSON 檔案
const updateConfig = (guildId, channelId, type) => {
    let config;
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading JSON file:', error);
        config = {};
    }

    if (!config[guildId]) {
        config[guildId] = {};
    }
    config[guildId][type] = channelId;

    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
};

// 定義 slash 指令的資料
export const data = new SlashCommandBuilder()
    .setName('mod_set_w_and_l_channel')
    .setDescription('Set the welcome or leave channel for the server')
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Type of channel to set')
            .setRequired(true)
            .addChoices(
                { name: 'Welcome Channel', value: 'welcome' },
                { name: 'Leave Channel', value: 'leave' }
            )
    )
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to set')
            .setRequired(true)
            .addChannelTypes(0) // 0  = 文字頻道
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

// 定義執行 slash 指令的函數
export const execute = async (interaction) => {
    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel');
    const channelId = channel.id;
    const guildId = interaction.guild.id;

    // 更新 JSON 檔案
    if (type === 'welcome') {
        updateConfig(guildId, channelId, 'welcomeChannelID');
        await interaction.reply(`Welcome channel has been set to <#${channelId}>.`);
    } else if (type === 'leave') {
        updateConfig(guildId, channelId, 'leaveChannelID');
        await interaction.reply(`Leave channel has been set to <#${channelId}>.`);
    } else {
        await interaction.reply('Invalid channel type specified.');
    }
};