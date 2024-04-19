import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

const dinnerlistPath = 'datapackage/fun/dinner.json';

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname, { recursive: true });
}

// 定義為函數聲明以利用 JavaScript 的函數提升
function saveDinnerlists(dinnerlistsToSave = dinnerlists) {
    ensureDirectoryExistence(dinnerlistPath);
    const jsonObject = Object.fromEntries(dinnerlistsToSave.entries());
    try {
        fs.writeFileSync(dinnerlistPath, JSON.stringify(jsonObject, null, 2));
    } catch (err) {
        console.error('保存 JSON 失敗:', err);
    }
}

// 嘗試從文件中讀取已存儲的晚餐列表，如果不存在則創建空文件
function loadDinnerlists() {
    try {
        if (fs.existsSync(dinnerlistPath)) {
            const data = fs.readFileSync(dinnerlistPath, 'utf-8');
            return new Map(Object.entries(JSON.parse(data)));
        } else {
            // 文件不存在，初始化一個空的 Map 並嘗試創建文件
            saveDinnerlists(new Map());
        }
    } catch (err) {
        console.error('解析或創建 JSON 失敗:', err);
    }
    return new Map();
}

let dinnerlists = loadDinnerlists();

// 定義 Slash Command
export const data = new SlashCommandBuilder()
    .setName('fun_add_dinner')
    .setDescription('Add a dinner to the dinner list')
    .addStringOption(option =>
        option.setName('dinner')
        .setDescription('新增菜單項目')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

// 添加晚餐項目到列表
function addDinner(guildId, dinner) {
    const dinnerlist = dinnerlists.get(guildId) || [];
    dinnerlist.push(dinner);
    dinnerlists.set(guildId, dinnerlist);
    saveDinnerlists();
}

// 執行 Slash Command 的處理函數
export const execute = async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'fun_add_dinner') return;

    const dinner = interaction.options.getString('dinner');
    if (!dinner) {
        await interaction.reply({ content: '請提供晚餐菜單項目。', ephemeral: true });
        return;
    }

    addDinner(interaction.guildId, dinner);
    await interaction.reply(`成功新增菜單項目: ${dinner}`);
};
