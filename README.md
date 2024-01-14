# Discord 音樂和管理機器人

此 Discord 機器人旨在提供音樂播放和基礎管理功能。以下是可用的指令和功能。

## 音樂指令(目前僅支援Youtube)

- `/music_play`
  - **描述**：播放播放列表中的歌曲。

- `/music_add`
  - **描述**：將歌曲添加到播放列表。
  - **參數**：
    - `url`（必填）：要添加的歌曲的 URL。

- `/music_remove`
  - **描述**：從播放列表中刪除指定的歌曲。
  - **參數**：
    - `url`（必填）：要刪除的歌曲的 URL。

- `/music_showplaylist`
  - **描述**：顯示當前播放列表。

- `/music_skip`
  - **描述**：跳轉到播放列表中的下一首歌曲。

- `/music_stop`
  - **描述**：停止播放當前歌曲。

## 管理指令

- `/mod_del_message`
  - **描述**：刪除訊息。
  - **參數**：
    - `message_number`（必填）：要刪除的訊息數量。
    - `reliable_vintage_model`（選填）：時間範圍超過兩週或訊息數量超過100。

## 機器人指令

- `/bot_test`
  - **描述**：機器人的測試指令。

## 用戶歡迎與離開訊息

機器人支援在用戶加入與離開時發送訊息，在用戶加入伺服器時會發送歡迎訊息與橫幅，離開則是簡單的文字訊息

## 角色管理

機器人根據用戶對特定訊息的反應管理角色。`.env` 文件中包含了 `targetMessageId` 的配置，而 `roles.json` 文件則包含了 `emojiId` 對應到 `roleId` 的映射。`targetMessageId`為要監聽的指定訊息，用戶在這條訊息反應時則查詢`roles.json`中的`emojis`，如果有`emojiId`則給予對應的`roleId`。這設置允許機器人根據用戶對指定訊息的反應添加角色。

## 伺服器日誌記錄

機器人支援日誌紀錄功能，用於記錄伺服器內的事件，例如用戶加入/離開語音頻道和訊息刪除。
此日誌紀錄功能模組已經設定好，當您的機器人啟動時，它會開始監聽並記錄一些事件，並記錄文字訊息在 `messages.json` 。

以下是一些支援的事件：

- 用戶加入/離開語音頻道
- 訊息刪除

請注意，為了正確運行這個功能，您需要確保您的機器人有足夠的權限，如 `READ_MESSAGE_HISTORY`、`VIEW_CHANNEL` 等。

## 機器人狀態配置

`main.js` 文件包含了對 `client.on('ready', ...) `事件的修改，用於設置機器人的狀態。當前配置將機器人的活動設置為 `"死神塔"`，並將狀態設置為 `"請勿打擾"` `(status: 'dnd')`。您可以自定義此部分以設置所需的機器人狀態。

## 開始使用

1. 克隆存儲庫。

   ```bash
   git clone https://github.com/Rick783/Discord-bot.git
   ```
2. 安裝 Node.js 依賴。

   ```bash
   npm install nodejs
   ```
3. 安裝 Bot 依賴。

    ```bash
   npm install package.json
   ```
4. 在項目根目錄中創建一個 `.env` 文件，並添加您的機器人令牌。

    ```.env
    token=your-bot-token
    clientId=your-clientid
    ```
5. 在 `main.js` 文件中配置機器人狀態和其他設置。

    ```main.js
    client.user.setPresence({ activities: [{ name: '####' }], status: '####' });
    ```
7. 使用以下命令註冊斜線指令：

    ```bash
    node .deploy-commands.js
    ```
8. 使用以下命令運行機器人：

    ```bash
    node main.js
    ```
現在，機器人應已連接到您的 Discord 伺服器，準備提供音樂播放和管理功能。請確保機器人具有所需的權限（音樂、消息管理等）並選擇了正確的意圖（Intents）。

## 自定義功能

- 角色管理
  1. 在 `.env` 文件中配置 `targetMessageId`。

    ```
    targetMessageId=your-messageId
    ```
  2. 在 `roles.js` 文件中配置 `emojiId` 和 `roleId` 。

    ```roles.js
    {
    "emojis": [
      {
        "emojiId": "your-emojiId",
        "roleId": "your-roleId"
      },
      {
        "emojiId": "your-emojiId2",
        "roleId": "your-roleId2"
      }
    ]
    }
    ```

- 歡迎訊息
  1. 在 `.env` 中添加 `welcomeChannelID` 和 `leaveChannelID`
    ```.env
    welcomeChannelID=your-welcomeChannel-id
    leaveChannelID=your-leaveChannel-id
    ```
  2. 在 `main.js` 中配置文本訊息
    `guildMemberAdd`
    ```main.js
    .setTitle(`## ${member.user.tag} ######`)
    .setDescription(`${member.user.toString()}######`)
    ```
    `guildMemberRemove`
    ```main.js
    leaveChannel.send(`**${member.user.tag}** ######。`);
    ```
  3. 自訂歡迎橫幅，將橫幅放到機器人根目錄並將其命名為 `welcome-banner.png` ，如果不需要橫幅將其刪除即可。

- 日誌紀錄
  1. 在 `.env` 中配置 `logChannelID` 
  ```.env
  logChannelID=your-logChannel-id
  ```
  2. 如果不需要文字紀錄功能可將以下刪除，以減小空間使用
  ```log.js
      // 監聽訊息創建事件
    client.on('messageCreate', message => {
        // 儲存用戶發送的訊息到 JSON 文件
        saveUserMessage(message);
    });

    // 監聽訊息刪除事件
    client.on('messageDelete', message => {
        logEvent('訊息刪除', `**${message.author.tag}** 刪除了訊息 ID: ${message.id}`);
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
        console.log('Received message:', message);
    
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
  ```

### 貢獻

如果您有興趣為此機器人做出貢獻，請參閱我們的 [貢獻準則](link-to-contributing-guidelines)。

### 問題和反饋

如果您遇到任何問題或有建議，請在 [GitHub 存儲庫](link-to-repository) 中提交問題。

感謝您使用我們的 Discord 機器人！