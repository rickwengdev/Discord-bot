import {SlashCommandBuilder,PermissionFlagsBits} from 'discord.js'

export const data = new SlashCommandBuilder()
		.setName('bot_test')
		.setDescription('test bot')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

	export async function execute(interaction){
		await interaction.reply('test success!');
	}