// 刪除指定數量的消息，並回應用戶
const deleteMessagesAsync = async (interaction, numberOfMessagesToDelete, timeRangeBig) => {
    try {
        // 檢查是否應該中止交互
        if (shouldAbortInteraction(interaction)) {
            console.error('Invalid interaction or already replied or deferred:', interaction);
            return;
        }

        const channel = interaction.channel;
        const deletePromise = deleteMessages(channel, numberOfMessagesToDelete, timeRangeBig);

        await interaction.deferReply({ ephemeral: true });

        try {
            // 使用 Promise.race 選擇較快解決的 Promise
            const result = await Promise.race([deletePromise]);

            // 根據 result 的值執行相應的操作
            if (result > 0) {
                // 刪除操作成功，執行相應的處理
                await interaction.editReply(`Deleted ${result} messages`, { ephemeral: true });
            } else {
                // 如果 result <= 0，可能表示沒有消息被刪除
                await interaction.editReply('No messages were deleted', { ephemeral: true });
            }
        } catch (error) {
                // 在這裡處理其他可能的錯誤
                handleReplyError(error);
            }
    } catch (error) {
        // 在這裡處理其他可能的錯誤
        handleDeleteError(error, interaction);
    }
};

// 根據條件刪除消息，返回刪除的消息數量
const deleteMessages = async (channel, numberOfMessagesToDelete, timeRangeBig) => {
    if (timeRangeBig || numberOfMessagesToDelete > 100) {
        console.log('🔄Too many messages to delete at once. Performing multiple deletes.');
        return bulkDeleteMessages(channel, numberOfMessagesToDelete);
    } else {
        const deletedMessages = await channel.bulkDelete(numberOfMessagesToDelete);
        return deletedMessages.size;
    }
};

// 批量刪除消息
const bulkDeleteMessages = async (channel, numberOfMessagesToDelete) => {
    let remainingMessages = numberOfMessagesToDelete;
    const batchSize = 100;
    const delayBetweenBatches = 500; // 增加的延遲時間，以毫秒為單位

    try {
        while (remainingMessages > 0) {
            const messagesToDelete = Math.min(remainingMessages, batchSize);
            const fetchedMessages = await channel.messages.fetch({ limit: messagesToDelete });

            // 將刪除操作包裝在 Promise.allSettled 中，以確保即使其中一個操作失敗也不會中斷循環
            await Promise.allSettled(fetchedMessages.map(message => message.delete()));

            remainingMessages -= messagesToDelete;

            // 在批次之間增加延遲
            if (remainingMessages > 0) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
            }
        }

        return numberOfMessagesToDelete;
    } catch (error) {
        console.error('Error deleting messages:', error);
        return 0; // 返回 0 表示刪除失敗
    }
};

// 判斷是否應該中止交互
const shouldAbortInteraction = (interaction) => {
    return interaction.deferred || interaction.replied || !interaction.isCommand();
};

// 處理回應消息時的錯誤
const handleReplyError = (error) => {
    if (error.code === 'InteractionAlreadyReplied') {
        console.log('Interaction already replied.');
    } else {
        console.error('Error replying to interaction:', error);
    }
};

// 處理刪除消息時的錯誤，並回應用戶
const handleErrorResponse = async (error, interaction, errorMessage) => {
    console.error(errorMessage, error);

    try {
        await interaction.editReply(errorMessage);
    } catch (replyError) {
        handleReplyError(replyError);
    }
};

// 在其他地方使用 handleErrorResponse 函數
const handleDeleteError = async (error, interaction) => {
    if (error.code === 50013) {
        handleErrorResponse(error, interaction, 'I don\'t have permission to delete messages.');
    } else {
        handleErrorResponse(error, interaction, 'An error occurred while deleting messages.');
    }
};

export {
    deleteMessagesAsync
};