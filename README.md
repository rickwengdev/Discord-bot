# Discord 音樂和管理機器人

此 Discord 機器人旨在提供音樂播放和管理功能。以下是可用的指令和功能。

## 音樂指令

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
  - **描述**：刪除指定的訊息。

- `/bot_test`
  - **描述**：機器人的測試指令。

## 角色管理

機器人根據用戶對特定訊息的反應管理角色。`main.js` 文件中包含了 `targetMessageId` 的配置，而 `roles.json` 文件則包含了 `emojiId` 對應到 `roleId` 的映射。這設置允許機器人根據用戶對指定訊息的反應添加角色。

## 機器人狀態配置

`main.js` 文件包含了對 `client.on('ready', ...) `事件的修改，用於設置機器人的狀態。當前配置將機器人的活動設置為 `"死神塔"`，並將狀態設置為 "請勿打擾" `(status: 'dnd')`。您可以自定義此部分以設置所需的機器人狀態。

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
3. 在項目根目錄中創建一個 `.env` 文件，並添加您的機器人令牌。

    ```env
    token=your-bot-token
    clientId=your-clientid
    ```
4. 在 `main.js` 文件中配置 `targetMessageId`。

    ```main.js
    const targetMessageId = 'your-messageId'
    ```
5. 在 `roles.js` 文件中配置 `emojiId` 和 `roleId` 。

    ```roles.js
    {
    "emojis": [
      {
        "emojiId": "your-emojiId",
        "roleId": "your-roleId"
      }
    ]
    }
    ```
6. 在 `main.js` 文件中配置機器人狀態和其他設置。

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

### 貢獻

如果您有興趣為此機器人做出貢獻，請參閱我們的 [貢獻準則](link-to-contributing-guidelines)。

### 問題和反饋

如果您遇到任何問題或有建議，請在 [GitHub 存儲庫](link-to-repository) 中提交問題。

感謝您使用我們的 Discord 機器人！