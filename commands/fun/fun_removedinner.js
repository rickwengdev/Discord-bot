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

function saveDinnerlists(dinnerlistsToSave = dinnerlists) {
    ensureDirectoryExistence(dinnerlistPath);
    const jsonObject = Object.fromEntries(dinnerlistsToSave.entries());
    try {
        fs.writeFileSync(dinnerlistPath, JSON.stringify(jsonObject, null, 2));
    } catch (err) {
        console.error('保存 JSON 失敗:', err);
    }
}

function loadDinnerlists() {
    try {
        if (fs.existsSync(dinnerlistPath)) {
            const data = fs.readFileSync(dinnerlistPath, 'utf-8');
            return new Map(Object.entries(JSON.parse(data)));
        } else {
            saveDinnerlists(new Map());
        }
    } catch (err) {
        console.error('解析或創建 JSON 失敗:', err);
    }
    return new Map();
}

let dinnerlists = loadDinnerlists();

export const data = new SlashCommandBuilder()
    .setName('fun_remove_dinner')
    .setDescription('Remove a dinner from the dinner list')
    .addStringOption(option =>
        option.setName('dinner')
        .setDescription('要刪除的菜單項目')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

function removeDinner(guildId, dinner) {
    const dinnerlist = dinnerlists.get(guildId) || [];
    const dinnerIndex = dinnerlist.indexOf(dinner);
    if (dinnerIndex === -1) {
        console.log('晚餐未在列表中找到。');
        return false; // 未找到项，返回 false
    }
    dinnerlist.splice(dinnerIndex, 1); // 正确使用 splice 方法
    dinnerlists.set(guildId, dinnerlist);
    saveDinnerlists();
    return true; // 成功删除后，返回 true
}

export const execute = async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'remove_dinner') return;

    const dinner = interaction.options.getString('dinner');
    if (!dinner) {
        await interaction.reply({ content: '請提供晚餐菜單項目。', ephemeral: true });
        return;
    }

    const success = removeDinner(interaction.guildId, dinner);
    if (success) {
        await interaction.reply(`成功刪除菜單項目: ${dinner}`);
    } else {
        await interaction.reply(`找不到菜單項目: ${dinner}`, { ephemeral: true });
    }
};
