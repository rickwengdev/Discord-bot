// 引入 dotenv 模組，用於載入環境變數
import dotenv from 'dotenv'
dotenv.config()

import {addRoleFromReaction, removeRoleFromReaction} from './roleManager.js'

// 設置目標訊息 ID
const targetMessageId = process.env.targetMessageId

function messageReaction(client) {
    // 處理訊息反應新增事件
    client.on('messageReactionAdd', async (reaction, user) => {
        if (reaction.message.id === targetMessageId) {
            addRoleFromReaction(reaction, user)
        }
    })

    // 處理訊息反應移除事件
    client.on('messageReactionRemove', async (reaction, user) => {
        if (reaction.message.id === targetMessageId) {
            removeRoleFromReaction(reaction, user)
        }
    })

    // 處理特定訊息的反應新增事件以添加角色
    client.on('messageReactionAdd', async (reaction, user) => {
        const targetMessageId2 = "1194879627966029844"
        const guild = reaction.message.guild
        const member = guild.members.cache.get(user.id)
        if (reaction.message.id === targetMessageId2) {
            const roleId = "1003922175927013416"
            const role = guild.roles.cache.get(roleId)
            if (role) {
                member.roles.add(role)
            }
        }
    })

    // 處理特定訊息的反應移除事件以移除角色
    client.on('messageReactionRemove', async (reaction, user) => {
        const targetMessageId2 = "1194879627966029844"
        const guild = reaction.message.guild
        const member = guild.members.cache.get(user.id)
        if (reaction.message.id === targetMessageId2) {
            const roleId = "1003922175927013416"
            const role = guild.roles.cache.get(roleId)
            if (role) {
                member.roles.remove(role)
            }
        }
    })
}

export {
    messageReaction
}