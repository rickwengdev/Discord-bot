const {SlashCommandBuilder} = require('discord.js')
const images = require('../picture.json').images

module.exports = {
    data : new SlashCommandBuilder()
    .setName('跟玥玥對賭')
    .setDescription('賭贏拿色圖')
    .addNumberOption(option => option
        .setName('lucknumber')
        .setDescription('user luck number')
        .setRequired(true)),
async execute(interaction){
    const computernumber = Math.floor(Math.random() * 100) + 1
    const usernumber = interaction.options.getNumber('lucknumber')
    const imagesurl = getRandomImageUrl()

    function getRandomImageUrl() {
        return images[Math.floor(Math.random() * images.length)];
    }      

if(interaction.guildId == "977115902338297906"){
    if(interaction.channel.id == "1083631894807195648" || interaction.channel.id == "1007639350323986472"){
        if(usernumber == computernumber){
        interaction.reply("你獲得了一張色圖，淦死變態\n"+(imagesurl))
        }else{
        interaction.reply(`${interaction.member}，我的數字是${computernumber}，真可惜～`)
        }
    }else{
        interaction.reply(`${interaction.member}，請在賭博區內使用喔～`)
    }
}else{
    if(usernumber == computernumber){
        interaction.reply("你獲得了一張色圖，淦死變態\n"+(imagesurl))
    }else{
        interaction.reply(`${interaction.member}，我的數字是${computernumber}，真可惜～`)
    }
}


    }   
}