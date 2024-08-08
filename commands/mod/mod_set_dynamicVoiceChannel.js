import fs from 'fs';
import path from 'path';
import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';

// 获取当前目录路径
const __dirname = path.dirname(new URL(import.meta.url).pathname);

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

export const data = new SlashCommandBuilder()
    .setName('mod_set_setdynamicvoicechannel')
    .setDescription('Set the dynamic voice channel for the server')
    .addChannelOption(option => 
        option.setName('channel')
            .setDescription('The voice channel to set')
            .setRequired(true)
            .addChannelTypes(2) // 2 is for voice channels
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild);
    ;

export const execute = async (interaction) => {
    const channel = interaction.options.getChannel('channel');
    const channelId = channel.id;
    const guildId = interaction.guild.id;

    // Update JSON file with the new channel ID
    updateConfig(guildId, channelId);

    await interaction.reply(`Dynamic voice channel has been set to <#${channelId}>.`);
};