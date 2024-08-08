# Discord 音樂和管理機器人

此 Discord 機器人旨在提供音樂播放和基礎管理功能。以下是可用的指令和功能。
基於`Discord.js v14`

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

如果您正在使用`VPS/VPN`，可能出現`State Code 403`錯誤，請使用`cookies`或是`proxy`，具體請參考[@distube/ytdl-core](https://github.com/distubejs/ytdl-core/blob/master/README.md)將其加入`ytdl()`，您的代碼看起來會是這樣`ytdl(url, {agent})`或是`ytdl.getBasicInfo(url, {agent})`，`agent`可替換為任何變數只要符合格式即可。

## 管理指令

- `/mod_delmessage`
  - **描述**：刪除訊息。
  - **參數**：
    - `message_number`（必填）：要刪除的訊息數量。
    - `reliable_vintage_model`（選填）：時間範圍超過兩週或訊息數量超過100。

## 機器人指令

- `/bot_test`
  - **描述**：機器人的測試指令。

## 用戶歡迎與離開訊息

機器人支援在用戶加入與離開時發送訊息，在用戶加入伺服器時會發送歡迎訊息與橫幅，離開則是簡單的文字訊息

- `/mod_set_w_and_l_channel`
  - **描述**：設定發送歡迎與離開訊息頻道
  - **參數**：
    - `type`：選擇設定歡迎/離開
    - `channel`：選擇頻道

## 角色管理

機器人根據用戶對特定訊息的反應管理角色。`messageReaction.json`文件中包含了`messageID`的配置，同時包含了`emoji`對應到`roleId`的映射。`messageID`為要監聽的指定訊息，用戶在這條訊息反應時則查詢`emoji`對應的`roleId`，如果有將給予`roleId`，這設置允許機器人根據用戶對指定訊息的反應添加角色。

- `/mod_set_reactionrole`
  - **描述**：設定將反應新增至訊息時要指派的角色
  - **參數**：
    - `channel`：訊息所在的頻道
    - `messageid`：訊息id
    - `emoji`：反映表情符號
    - `role`：角色

## 自動創建語音頻道
這個機器人功能允許在 Discord 服務器上自動管理語音頻道。當用戶加入指定的觸發語音頻道時，機器人將自動創建一個新的語音頻道，以用戶的名字命名。用戶將移動到這個新創建的頻道。當用戶離開並且頻道空無一人時，該頻道將被自動刪除。

- `/mod_set_setdynamicvoicechannel`
  - **描述**：設定設定伺服器動態語音頻道
  - **參數**：
    - `channel`：base的語音頻道

## 伺服器日誌記錄(暫時停用)

機器人支援日誌紀錄功能，用於記錄伺服器內的事件，例如用戶加入/離開語音頻道和訊息刪除。
此日誌紀錄功能模組已經設定好，當您的機器人啟動時，它會開始監聽並記錄一些事件，並記錄文字訊息在`messages.json`。

以下是一些支援的事件：

- 用戶加入/離開語音頻道
- 訊息刪除

請注意，為了正確運行這個功能，您需要確保您的機器人有足夠的權限，如`READ_MESSAGE_HISTORY`、`VIEW_CHANNEL`等。

## 機器人狀態配置

`main.js`文件包含了對`client.on('ready', ...)`事件的修改，用於設置機器人的狀態。當前配置將機器人的活動設置為`DISCORD.JS`，並將狀態設置為`"請勿打擾"` `(status: 'dnd')`。您可以自定義此部分以設置所需的機器人狀態。

## 開始使用

使用`Docker`或根據以下步驟部署

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
   npm install
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
6. 使用以下命令註冊斜線指令：

    ```bash
    node .deploy-commands.js
    ```
7. 使用以下命令運行機器人：

    ```bash
    node main.js
    ```

現在，機器人應已連接到您的 Discord 伺服器，準備提供音樂播放功能。如果你需要其他的功能請參照上述指令使用方式配置，確保機器人具有所需的權限（音樂、消息管理等）並選擇了正確的意圖（Intents）。

此外若您部署前想體驗該機器人，請聯繫[Email](rick783256@gmail.com)並邀請[Discord 音樂和管理機器人](https://discord.com/oauth2/authorize?client_id=1270504075741630464&permissions=8&integration_type=0&scope=bot)

## 貢獻

如果您有興趣為此機器人做出貢獻，請參閱我們的[貢獻準則](https://github.com/Rick783/Discord-bot/blob/main/CONTRIBUTING.md)。

## 問題和反饋

如果您遇到任何問題或有建議，請在[GitHub 存儲庫](https://github.com/Rick783/Discord-bot)中提交問題。

感謝您使用我們的 Discord 機器人！