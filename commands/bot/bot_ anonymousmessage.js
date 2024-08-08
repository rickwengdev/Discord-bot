import { SlashCommandBuilder } from 'discord.js'

// 定義 slash 指令的資料
export const data = new SlashCommandBuilder()
    .setName('bot_anonymousmessage')
    .setDescription('Anonymous messages/endorsements')
    .addStringOption(option => 
        option.setName('message')
        .setDescription('Anonymous message to send')
        .setRequired(true))
    .addStringOption(option => 
        option.setName('messageid')
        .setDescription('Message id to reply to'))

// 定義執行 slash 指令的函數
export async function execute(interaction) {
    // 獲取指定的訊息
    const message = interaction.options.getString('message')
    const messageid = interaction.options.getString('messageid')

    // 回覆互動，確認已發送訊息
    if (messageid !== null || messageid !== undefined) {
        await interaction.reply({content:`Anonymous message sent:${message}, reply: ${messageid}`, ephemeral: true })
        await interaction.channel.send({content:message,reply: { messageReference: messageid }})
    } else {
        await interaction.reply({content:`Anonymous message sent:${message}`, ephemeral: true })
        await interaction.channel.send(message)
    }
}