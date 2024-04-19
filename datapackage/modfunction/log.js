// 引入 dotenv 模組，用於載入環境變數
import dotenv from 'dotenv';
dotenv.config();

// 引入所需的模組
import fs from 'fs';
import path from 'path';

const messagesFilePath = new URL('messages.json', import.meta.url).pathname;

// 定義在外部的 messagesData
let messagesData = { userMessages: [] };

function setupLogEvents(client) {
    // 監聽用戶加入語音頻道事件
    client.on('voiceStateUpdate', (oldState, newState) => {
        const member = newState.member;

        if (oldState.channelId !== newState.channelId) {
            if (oldState.channelId) {
                logEvent('用戶離開語音頻道', `**${member.user.tag}** 離開了語音頻道 "${oldState.channel.name}"`);
            }

            if (newState.channelId) {
                logEvent('用戶加入語音頻道', `**${member.user.tag}** 加入了語音頻道 "${newState.channel.name}"`);
            }
        }
    });

    // 監聽訊息創建事件
    client.on('messageCreate', message => {
        // 儲存用戶發送的訊息到 JSON 文件
        saveUserMessage(message);
    });

    // 監聽訊息刪除事件
    client.on('messageDelete', message => {
        logEvent('訊息刪除', `可能是 **${message.author ? message.author.tag : '未知用户'}** 刪除了訊息， ID: ${message.id}`, message.content);
    });

    // 儲存用戶發送的訊息到 JSON 文件
    function saveUserMessage(message) {
        // 如果訊息內容為空，不進行儲存
        if (!message.content) {
            console.log('Received a message with empty content. Skipping save.');
            return;
        }
    
        // 加載 JSON 文件中的數據
        messagesData = loadMessagesData();
    
        // Debug 訊息
        console.log('Received message:', message.content);
    
        // 儲存用戶發送的訊息
        messagesData.userMessages.push({
            author: message.author.tag,
            content: message.content,
            timestamp: message.createdTimestamp,
        });
    
        // 寫入更新後的數據到 JSON 文件
        fs.writeFileSync(messagesFilePath, JSON.stringify(messagesData, null, 2));
    }

    // 加載 JSON 文件中的數據
    function loadMessagesData() {
        try {
            // 讀取 JSON 文件中的數據，如果文件不存在則創建一個空的數據結構
            return JSON.parse(fs.readFileSync(messagesFilePath, 'utf-8'));
        } catch (error) {
            return { userMessages: [] };
        }
    }

    // 記錄事件到指定頻道
    function logEvent(interaction, eventDescription, messageContent = null) {
        const logChannelID = process.env.logChannelID; // 記錄頻道的 ID
        const logChannel = client.channels.cache.get(logChannelID);

        if (logChannel) {
         let logMessage = `**[${getCurrentTimestamp()}] ${interaction}:** ${eventDescription}`;
          if (messageContent) {
            logMessage += `\n**刪除的訊息內容:** ${messageContent}`;
           }

        logChannel.send(logMessage);
        } else {
        console.error('未找到記錄頻道。');
        }
    }

    // 獲取當前時間戳
    function getCurrentTimestamp() {
        const now = new Date();
        return `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    }
}

export { setupLogEvents };
