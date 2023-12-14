import { SlashCommandBuilder } from "discord.js";
import { createVoiceConnection } from "../../datapackge/musicfunction/playerManager.js";

export const data = new SlashCommandBuilder()
    .setName('join')
    .setDescription('join your voice channel')

export async function execute(){
    createVoiceConnection
}

