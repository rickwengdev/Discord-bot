import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { deleteMessagesAsync } from "../../datapackge/modfunction/modbasicfuntion.js";

// 創建 Slash 命令
export const data = new SlashCommandBuilder()
    .setName('del_message')
    .setDescription('Delete a message')
    .addIntegerOption(option =>
        option.setName('message_number')
            .setDescription('The number of the message to delete')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('fast_delete_model')
            .setDescription('The time range is less than two weeks or the number of messages is less than 100'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

// 執行 Slash 命令的處理函數
export async function execute(interaction) {
    const messageNumber = interaction.options.getInteger('message_number') + 1;
    let timeRangeBig = !interaction.options.getBoolean('reliable_vintage_model');
    console.log(timeRangeBig);
    if (timeRangeBig === null) timeRangeBig = true;
    await deleteMessagesAsync(interaction, messageNumber, timeRangeBig);
}
