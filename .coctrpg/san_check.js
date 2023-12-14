const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data : new SlashCommandBuilder()
    .setName('san_check')
    .setDescription('PC San Check')
    .addNumberOption(option => option
        .setName('san_number')
        .setDescription('PC San number')
        .setRequired(true))
    .addNumberOption(option => option
        .setName('loss_check_dice')
        .setDescription('loss of dice')
        .setRequired(true))
    .addNumberOption(option => option
        .setName('loss_check_dice_side')
        .setDescription('loss of dice side')
        .setRequired(true))
    .addNumberOption(option => option
        .setName('success_check_dice')
        .setDescription('Success of dice'))
    .addNumberOption(option => option
        .setName('success_check_dice_side')
        .setDescription('Success of dice side')),
async execute(interaction){
    const pcsan = interaction.options.getNumber('san_number')
    let sdice = interaction.options.getNumber('success_check_dice')
    let sdiceside = interaction.options.getNumber('success_check_dice_side')
    const ldice = interaction.options.getNumber('loss_check_dice')
    const ldiceside = interaction.options.getNumber('loss_check_dice_side')
    const sancheck = []

    for (let i = 0; i < 1; i++) {
        sancheck.push(Math.floor(Math.random() * 100) + 1);
    }

    const scfumble = sancheck.filter(roll => roll >= 96 & roll > pcsan).length
    const scbigSuccess = sancheck.filter(roll => roll <= 5 & roll <= pcsan).length
    const scloss = sancheck.filter(roll => roll > pcsan & roll < 96).length
    const scSuccess = sancheck.filter(roll => roll <= pcsan & roll < 96).length

    let total = 0

    if(sdice == null){
        sdice = 0
    }
    if(sdiceside == null){
        sdiceside = 0
    }

    if(scSuccess>0)
    {
        for (let i = 0; i < sdice; i++) {
            const roll = Math.floor(Math.random() * sdiceside) + 1;
            total += roll;
        }
        const sanend = pcsan - total

        interaction.reply(`${interaction.member}SAN值檢定成功(${sancheck})，SAN值為"${sanend}":(${pcsan}-${total})`)
    }
    if(scloss>0)
    {
        for (let i = 0; i < ldice; i++) {
            const roll = Math.floor(Math.random() * ldiceside) + 1;
            total += roll;
        }

        const sanend = pcsan - total

        interaction.reply(`${interaction.member}SAN值檢定失敗(${sancheck})，SAN值為"${sanend}":(${pcsan}-${total})`)
    }
    if(scbigSuccess>0)
    {
        const sanend = pcsan - sdice

        interaction.reply(`${interaction.member}誒！大成功！(${sancheck})，SAN值為"${sanend}":(${pcsan}-${sdice})`)
    }
    if(scfumble>0)
    {
        const sanend = pcsan - ldiceside

        interaction.reply(`${interaction.member}噔噔咚～大失敗！(${sancheck})，SAN值為"${sanend}":(${pcsan}-${sdice})`)
    }
    if(total>=5){
        interaction.channel.send("酷誒，看來有人要瘋囉～誒嘿")
    }
}
}