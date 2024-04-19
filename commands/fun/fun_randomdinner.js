import { SlashCommandBuilder } from "discord.js";
import fs from "fs/promises"; // 使用 fs 的 promises 接口

const dinnerlistPath = './datapackage/fun/dinner.json'; // 指定文件路径

// 创建 Slash 命令
export const data = new SlashCommandBuilder()
    .setName('fun_randomdinner')
    .setDescription('晚餐困難症好幫手');

// 执行 Slash 命令的处理函数
export async function execute(interaction) {
    try {
        // 异步读取 JSON 文件
        const data = await fs.readFile(dinnerlistPath, 'utf-8');
        const dinners = JSON.parse(data); // 解析 JSON 数据

        // 检查是否有可用的晚餐选项
        if (dinners.length === 0) {
            await interaction.reply('晚餐列表为空，请先添加一些晚餐选项！');
            return;
        }

        // 从数组中随机选择一个晚餐
        const randomDinner = dinners[Math.floor(Math.random() * dinners.length)];
        await interaction.reply('今天晚上吃：' + randomDinner);
    } catch (error) {
        // 错误处理
        console.error('读取晚餐列表失败:', error);
        await interaction.reply('无法读取晚餐列表，请检查文件系统或联系管理员！');
    }
}