const fs = require('fs');

function addServerToReactionRoles(serverId, emojiId, messageId) {
  // 读取 reactionRoleData.json 文件内容
  const rawData = fs.readFileSync('reactionRoleData.json');
  const reactionRoleData = JSON.parse(rawData);

  // 添加服务器 ID 到 reactionRoleData 对象中
  reactionRoleData[serverId] = {
    emojiId: emojiId,
    messageId: messageId,
  };

  // 将更新后的数据转换为 JSON 格式
  const updatedData = JSON.stringify(reactionRoleData, null, 2);

  // 将更新后的数据写入 reactionRoleData.json 文件中
  fs.writeFileSync('reactionRoleData.json', updatedData);
}

// 用法示例
const serverId = 'yourServerId';
const emojiId = 'yourEmojiId';
const messageId = 'yourMessageId';
addServerToReactionRoles(serverId, emojiId, messageId);
