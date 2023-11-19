const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data : new SlashCommandBuilder()
    .setName('roll_dice')
    .setDescription('Roll Dice')
    .addNumberOption(option => option
        .setName('dice')
        .setDescription('擲骰數量')
        .setRequired(true)
    )
    .addNumberOption(option => option
            .setName('sides')
            .setDescription('擲骰面數')
            .setRequired(true)
    )
    .addStringOption(option => option
            .setName('type')
            .setDescription('擲骰項目')
    )
    .addNumberOption(option => option
            .setName('add_number')
            .setDescription('擲骰加值')
    ),
    
    async execute(interaction){
        const numDice = interaction.options.getNumber('dice')
        const numSides = interaction.options.getNumber('sides')
        const type = interaction.options.getString('type')
        const addnumber = interaction.options.getNumber('add_number')

        if (isNaN(numDice) | isNaN(numSides)) {
            return interaction.reply(`You need to enter valid numbers!`);
        }

        const results = []
        let total = 0

        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * numSides) + 1;
            results.push(roll);
            total += roll;
        }

        if(addnumber){
            total = total + addnumber
            if(type){
                interaction.reply(`🎲${interaction.member}進行了“${type}”擲骰，擲出了(${results.join(', ')}+${addnumber}):(${total})`)
            }else{
                interaction.reply(`🎲${interaction.member}進行了擲骰，擲出了(${results.join(', ')}+${addnumber}):(${total})`)
    
            }
        }else{
            if(type){
                interaction.reply(`🎲${interaction.member}進行了“${type}”擲骰，擲出了(${results.join(', ')}):(${total})`)
            }else{
                interaction.reply(`🎲${interaction.member}進行了擲骰，擲出了(${results.join(', ')}):(${total})`)
    
            }
        }
    }
}