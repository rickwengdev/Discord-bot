import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs/promises'; // 使用 fs 的 promises 接口

const dinnerlistPath = './datapackage/fun/dinner.json'; // 指定 JSON 文件的路径

// 创建 Slash 命令
export const data = new SlashCommandBuilder()
    .setName('fun_showdinner')
    .setDescription('显示所有晚餐选项');

// 执行 Slash 命令的处理函数
export async function execute(interaction) {
    try {
        // 异步读取 JSON 文件
        const data = await fs.readFile(dinnerlistPath, 'utf-8');
        const dinners = JSON.parse(data); // 解析 JSON 数据

        // 获取当前服务器的 ID 作为键来获取晚餐选项数组
        const guildId = interaction.guildId;
        const dinnerOptions = dinners[guildId]; // 使用 guildId 从对象中取得晚餐列表

        // 检查解析出的数据是否为数组
        if (!Array.isArray(dinnerOptions) || dinnerOptions.length === 0) {
            await interaction.reply('当前晚餐列表为空，请添加一些晚餐选项！');
            return;
        }

        // 创建一个 embed 来显示晚餐列表
        const dinnerEmbed = new EmbedBuilder()
            .setColor('#0099ff') // 设置 embed 的颜色
            .setTitle('晚餐选项列表') // 设置 embed 的标题
            .setDescription(dinnerOptions.join('\n')) // 将所有晚餐选项加入描述，每个选项一行
            .setTimestamp(); // 嵌入时间戳

        // 使用 embed 发送响应
        await interaction.reply({ embeds: [dinnerEmbed] });
    } catch (error) {
        console.error('读取晚餐列表失败:', error);
        await interaction.reply('无法读取晚餐列表，请检查文件系统或联系管理员！');
    }
}
