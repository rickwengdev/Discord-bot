import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"
import { deleteMessagesAsync } from "../../datapackage/modfunction/modbasicfuntion.js"

// 創建 Slash 命令
export const data = new SlashCommandBuilder()
    .setName('mod_delete_message')
    .setDescription('Delete message')
    .addIntegerOption(option =>
        option.setName('message_number')
            .setDescription('Number of messages to delete')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('reliable_vintage_model')
            .setDescription('Is it the deletion mode for messages older than two weeks or more than 100 messages?'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

// 執行 Slash 命令的處理函數
export async function execute(interaction) {
    // 獲取要刪除的訊息數量和可靠的歷史模式選項
    const messageNumber = interaction.options.getInteger('message_number')
    let timeRangeBig = interaction.options.getBoolean('reliable_vintage_model')
    
    // 如果未提供模式選項，預設為 true
    if (timeRangeBig === null) timeRangeBig = true

    // 呼叫刪除訊息的自訂函數
    await deleteMessagesAsync(interaction, messageNumber, timeRangeBig)
}