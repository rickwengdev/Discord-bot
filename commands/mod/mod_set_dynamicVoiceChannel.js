import fs from 'fs';
import path from 'path';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

// 獲取當前檔案的路徑
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// 更新 JSON 檔案   
const updateConfig = (guildId, channelId) => {
    const configPath = path.resolve(__dirname, '../../datapackage/modfunction/dynamicVoiceChannel.json');
    let config;

    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading JSON file:', error);
        config = {};
    }

    config[guildId] = channelId;

    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
};

// 定義 slash 指令的資料
export const data = new SlashCommandBuilder()
    .setName('mod_set_setdynamicvoicechannel')
    .setDescription('Set the dynamic voice channel for the server')
    .addChannelOption(option => 
        option.setName('channel')
            .setDescription('The voice channel to set')
            .setRequired(true)
            .addChannelTypes(2) // 2 = 語音頻道
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    ;

// 定義執行 slash 指令的函數
export const execute = async (interaction) => {
    const channel = interaction.options.getChannel('channel');
    const channelId = channel.id;
    const guildId = interaction.guild.id;

    // 更新 JSON 檔案
    updateConfig(guildId, channelId);

    await interaction.reply(`Dynamic voice channel has been set to <#${channelId}>.`);
};