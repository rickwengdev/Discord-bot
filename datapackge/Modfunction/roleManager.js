// 引入文件系統模塊
const fs = require('fs');

// 定義文件路徑
const filePath = 'reactionRoleData.json';

// 讀取文件內容的私有函數
function _readFile() {
  let data;
  try {
    // 同步讀取文件內容
    const rawData = fs.readFileSync(filePath, 'utf8');
    // 解析 JSON 格式的數據
    data = JSON.parse(rawData);
  } catch (err) {
    // 錯誤處理：無法讀取文件或解析 JSON
    console.error('Failed to read file or parse JSON', err);
    data = {};
  }
  return data;
}

// 寫入文件內容的私有函數
function _writeFile(data) {
  // 格式化數據並寫入文件
  const updatedData = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(filePath, updatedData);
  } catch (err) {
    // 錯誤處理：無法寫入文件
    console.error('Failed to write file', err);
  }
}

// 根據伺服器 ID 獲取角色映射
function getRoleMap(serverId) {
  const reactionRoleData = _readFile();
  return reactionRoleData[serverId] || null;
}

// 添加角色映射
function addRoleMap(serverId, emojiId, messageId, roleId) {
  const reactionRoleData = _readFile();
  
  // 如果伺服器條目不存在，則創建一個
  if (!reactionRoleData[serverId]) {
    reactionRoleData[serverId] = {};
  }

  // 添加表情符號-消息-角色映射
  reactionRoleData[serverId][emojiId] = { messageId, roleId };
  
  // 寫入更新後的數據到文件
  _writeFile(reactionRoleData);
}

// 刪除角色映射
function deleteRoleMap(serverId, emojiId) {
  const reactionRoleData = _readFile();

  // 檢查伺服器和表情符號的映射是否存在
  if (reactionRoleData[serverId] && reactionRoleData[serverId][emojiId]) {
    // 刪除映射
    delete reactionRoleData[serverId][emojiId];
    // 寫入更新後的數據到文件
    _writeFile(reactionRoleData);
  }
}

// 將函數導出，以便在其他文件中使用
module.exports = {
  getRoleMap,
  addRoleMap,
  deleteRoleMap
};
