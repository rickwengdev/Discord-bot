const fs = require('fs');

const filePath = 'reactionRoleData.json';

function _readFile() {
  let data;
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to read file or parse JSON', err);
    data = {};
  }
  return data;
}

function _writeFile(data) {
  const updatedData = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(filePath, updatedData);
  } catch (err) {
    console.error('Failed to write file', err);
  }
}

function getRoleMap(serverId) {
  const reactionRoleData = _readFile();
  return reactionRoleData[serverId] || null;
}

function addRoleMap(serverId, emojiId, messageId, roleId) {
  const reactionRoleData = _readFile();
  
  // Create a server entry if it does not exist
  if (!reactionRoleData[serverId]) {
    reactionRoleData[serverId] = {};
  }

  // Add the emoji-message-role mapping
  reactionRoleData[serverId][emojiId] = { messageId, roleId };
  
  _writeFile(reactionRoleData);
}

function deleteRoleMap(serverId, emojiId) {
  const reactionRoleData = _readFile();

  if (reactionRoleData[serverId] && reactionRoleData[serverId][emojiId]) {
    delete reactionRoleData[serverId][emojiId];
    _writeFile(reactionRoleData);
  }
}

module.exports = {
  getRoleMap,
  addRoleMap,
  deleteRoleMap
};
