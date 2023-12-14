import SlashCommandBuilder from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('roll_check')
    .setDescription('Roll COC skill check')
    .addNumberOption(option => option
        .setName('skill_levels')
        .setDescription('技能等級')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('skill_name')
        .setDescription('技能名稱')
    )
    // .addNumberOption(option => option
    //     .setName('bonus_dice')
    //     .setDescription('獎勵骰'))
    // .addNumberOption(option => option
    //     .setName('punish_dice')
    //     .setDescription('懲罰骰')
    // )
    


    export async function execute(){}
        // Your code here
        const skill = interaction.options.getNumber('skill_levels')
        const diceRolls = []
        const bonusDices = []
        const punishDices = []
        const skillname = interaction.options.getString('skill_name')
        const bonusDice = interaction.options.getNumber('bonus_dice')
        const punishDice = interaction.options.getNumber('punish_dice')
        //
        let resultMessage
        let diceRoll
        
        for (let i = 0; i < 1 ; i++) {
            diceRoll = Math.floor(Math.random() * 100) + 1
            diceRolls.push(diceRoll);
        }
        //
        if(bonusDice){
            for (let i = 0; i < bonusDice; i++) {
                let bonusDiceRoll = (Math.floor(Math.random() * 10) + 1) * 10 + diceRolls[0]
                if(bonusDiceRoll > 100){
                    bonusDiceRoll = bonusDiceRoll - 100
                }
                bonusDices.push(bonusDiceRoll)
            }

        }  
        //
        if(punishDice){
            for (let i = 0; i < punishDice; i++) {
                let punishDiceRoll = (Math.floor(Math.random() * 10) + 1) * 10 + diceRolls[0]
                if(punishDiceRoll > 100){
                    punishDiceRoll = punishDiceRoll - 100
                }
                punishDices.push(punishDiceRoll)
            }
        }
        //
        const loss = diceRolls.filter(roll => roll > skill & roll < 96).length
        const regularSuccess = diceRolls.filter(roll => roll <= skill & roll > Math.floor(skill / 2)).length
        const hardSuccess = diceRolls.filter(roll => roll <= Math.floor(skill / 2) & roll > Math.floor(skill / 5)).length
        const extremeSuccess = diceRolls.filter(roll => roll <= Math.floor(skill / 5) & roll > 5).length
        const bigSuccess = diceRolls.filter(roll => roll <= 5 & roll <= skill).length
        const fumble = diceRolls.filter(roll => roll >= 96 & roll > skill).length
        // //
        // const bdloss = bonusDices.filter(roll => roll > skill & roll < 96).length
        // const bdregularSuccess = bonusDices.filter(roll => roll <= skill & roll > Math.floor(skill / 2)).length
        // const bdhardSuccess = bonusDices.filter(roll => roll <= Math.floor(skill / 2) & roll > Math.floor(skill / 5)).length
        // const bdextremeSuccess = bonusDices.filter(roll => roll <= Math.floor(skill / 5) & roll > 5).length
        // const bdbigSuccess = bonusDices.filter(roll => roll <= 5 & roll <= skill).length
        // const bdfumble = bonusDices.filter(roll => roll >= 96 & roll > skill).length
        // //
        // const pdloss = punishDices.filter(roll => roll > skill & roll < 96).length
        // const pdregularSuccess = punishDices.filter(roll => roll <= skill & roll > Math.floor(skill / 2)).length
        // const pdhardSuccess = punishDices.filter(roll => roll <= Math.floor(skill / 2) & roll > Math.floor(skill / 5)).length
        // const pdextremeSuccess = punishDices.filter(roll => roll <= Math.floor(skill / 5) & roll > 5).length
        // const pdbigSuccess = punishDices.filter(roll => roll <= 5 & roll <= skill).length
        // const pdfumble = punishDices.filter(roll => roll >= 96 & roll > skill).length

        

        if(skillname){
            if(bonusDice){resultMessage = `🎲${interaction.member}進行了“${skillname}”檢定(技能值 ${skill}):${diceRolls.join(', ')}, ${bonusDices.join(', ')}\n`}
            else{resultMessage = `🎲${interaction.member}進行了“${skillname}”檢定(技能值 ${skill}):${diceRolls.join(', ')}\n`}
        }else{
            if(bonusDice){resultMessage = `🎲${interaction.member}進行了檢定(值 ${skill}):${diceRolls.join(', ')}, ${bonusDices.join(', ')}\n`}
            else{resultMessage = `🎲${interaction.member}進行了檢定(技能值 ${skill}):${diceRolls.join(', ')}\n`}
        }
        
        // if(bonusDice == null & punishDice == null){
        if (regularSuccess > 0) {
            interaction.reply(resultMessage + `普通成功`)
        }
        if (hardSuccess > 0) {
            interaction.reply(resultMessage + `困難成功`)
        }
        if (extremeSuccess > 0) {
            interaction.reply(resultMessage + `哦～極限成功`)
        }
        if (bigSuccess > 0) {
            interaction.reply(resultMessage + `誒！噔噔噔～大成功！`)
        }
        if (loss > 0) {
            interaction.reply(resultMessage + "ㄨㄚˊ～失敗")
        }
        if (fumble > 0){
            interaction.reply(resultMessage + `噔噔咚～，大失敗`)
        }
    // }else if (bonusDice == null){
    //     if (regularSuccess > 0 | pdbigSuccess > 0) {
    //         interaction.reply(resultMessage + `普通成功`)
    //     }
    //     if (hardSuccess > 0) {
    //         interaction.reply(resultMessage + `困難成功`)
    //     }
    //     if (extremeSuccess > 0) {
    //         interaction.reply(resultMessage + `哦～極限成功`)
    //     }
    //     if (bigSuccess > 0) {
    //         interaction.reply(resultMessage + `誒！噔噔噔～大成功！`)
    //     }
    //     if (loss > 0) {
    //         interaction.reply(resultMessage + "ㄨㄚˊ～失敗")
    //     }
    //     if (fumble > 0){
    //         interaction.reply(resultMessage + `噔噔咚～，大失敗`)
    //     }
    // }