const {SlashCommandBuilder,PermissionFlagsBits} = require('discord.js')
const images = require('../picture.json').images
const fs = require('fs')

module.exports = {
    data : new SlashCommandBuilder()
    .setName("push_picture")
    .setDescription("push picture to server")
    .addStringOption(option => option
        .setName("url")
        .setDescription("https://imgur.com/example")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
async execute(interaction)
    {
        const url = interaction.options.getString('url')
        images.push(url)
        fs.writeFile('./picture.json', JSON.stringify({ images }), err => {
        if (err) {
            console.error(err)
            return interaction.reply({ content: '寫入失敗', ephemeral: true })
        }
    interaction.reply({ content: '成功加入圖片', ephemeral: true })
    })
      }
    }