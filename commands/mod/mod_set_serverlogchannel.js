import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { setup } from '../../main.js';

// 使用 ES 模块来获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../datapackage/modfunction/logservermessage.json');

// 讀取 JSON 檔案
function loadConfig() {
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
    .setName('mod_set_serverlogchannel')
    .setDescription('Set the log channel for server events')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel where logs will be sent')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

// 定義執行 slash 指令的函數
export const execute = async (interaction) => {
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;

    const config = loadConfig();

    // 設定伺服器的日志頻道
    config[guildId] = channel.id;
    saveConfig(config);

    await interaction.reply(`Log channel set to: ${channel.name}`);

    setup()
};