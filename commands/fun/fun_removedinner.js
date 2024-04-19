import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import fs from 'fs'
import path from 'path'

const dinnerlistPath = 'datapackage/fun/dinner.json'

// 確保文件夾存在，如果不存在則創建
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
        return true
    }
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname, { recursive: true })
}

// 保存晚餐列表到文件
function saveDinnerlists(dinnerlistsToSave = dinnerlists) {
    ensureDirectoryExistence(dinnerlistPath)
    const jsonObject = Object.fromEntries(dinnerlistsToSave.entries())
    try {
        fs.writeFileSync(dinnerlistPath, JSON.stringify(jsonObject, null, 2))
    } catch (err) {
        console.error('保存 JSON 失敗:', err)
    }
}

// 加載晚餐列表
function loadDinnerlists() {
    try {
        if (fs.existsSync(dinnerlistPath)) {
            const data = fs.readFileSync(dinnerlistPath, 'utf-8')
            return new Map(Object.entries(JSON.parse(data)))
        } else {
            saveDinnerlists(new Map())
        }
    } catch (err) {
        console.error('解析或創建 JSON 失敗:', err)
    }
    return new Map()
}

let dinnerlists = loadDinnerlists()

export const data = new SlashCommandBuilder()
    .setName('fun_remove_dinner')
    .setDescription('從晚餐清單中移除一項晚餐')
    .addStringOption(option =>
        option.setName('dinner')
        .setDescription('要刪除的菜單項目')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

// 移除指定的晚餐項
function removeDinner(guildId, dinner) {
    const dinnerlist = dinnerlists.get(guildId) || []
    const dinnerIndex = dinnerlist.indexOf(dinner)
    if (dinnerIndex === -1) {
        console.log('晚餐未在列表中找到。')
        return false // 未找到項，返回 false
    }
    dinnerlist.splice(dinnerIndex, 1)
    dinnerlists.set(guildId, dinnerlist)
    saveDinnerlists()
    return true // 成功刪除後，返回 true
}

// 處理命令交互
export const execute = async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'fun_remove_dinner') return

    const dinner = interaction.options.getString('dinner')
    if (!dinner) {
        await interaction.reply({ content: '請提供晚餐菜單項目。', ephemeral: true })
        return
    }

    const success = removeDinner(interaction.guildId, dinner)
    if (success) {
        await interaction.reply(`成功刪除菜單項目: ${dinner}`)
    } else {
        await interaction.reply(`找不到菜單項目: ${dinner}`, { ephemeral: true })
    }
}