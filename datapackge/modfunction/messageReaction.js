// 引入 dotenv 模組，用於載入環境變數
import dotenv from 'dotenv';
dotenv.config();

import {addRoleFromReaction, removeRoleFromReaction} from './roleManager.js';

// 設置目標訊息 ID
const targetMessageId = process.env.targetMessageId;

function messageReaction(client){
// 處理訊息反應新增事件
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.id === targetMessageId) {
        addRoleFromReaction(reaction, user);
    }
});

// 處理訊息反應移除事件
client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.message.id === targetMessageId) {
        removeRoleFromReaction(reaction, user);
    }
});
}

export {
    messageReaction
}