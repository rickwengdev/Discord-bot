// 引入所需的模組
import fs from 'fs';
import path from 'path';

// 取得目前檔案和目錄的路徑
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// 函式：根據使用者的反應為成員新增角色
const addRoleFromReaction = (reaction, user) => {
    // JSON 檔案中包含角色-表情符號對應的路徑
    const rolesFilePath = path.join(__dirname, 'roles.json');
    
    // 從 JSON 檔案中讀取並解析角色資料
    const rolesData = JSON.parse(fs.readFileSync(rolesFilePath, 'utf8'));

    // 從反應中取得伺服器和成員物件
    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);

    // 檢查成員是否存在
    if (member) {
        // 在角色配置中尋找匹配的表情符號資料
        const matchedEmoji = rolesData.emojis.find(emojiData => emojiData.emojiId === reaction.emoji.id);

        // 如果找到匹配的表情符號
        if (matchedEmoji) {
            // 取得角色 ID 和相應的角色物件
            const roleId = matchedEmoji.roleId;
            const role = guild.roles.cache.get(roleId);

            // 如果角色物件存在，將角色新增給成員
            if (role) {
                member.roles.add(role)
                    .catch(error => {
                        // 處理新增角色時的錯誤
                        console.error(`Error adding role: ${error.message}`);
                    });
            }
        }
    }
}

// 函式：根據使用者的反應從成員中移除角色
const removeRoleFromReaction = (reaction, user) => {
    // JSON 檔案中包含角色-表情符號對應的路徑
    const rolesFilePath = path.join(__dirname, 'roles.json');
    const rolesData = JSON.parse(fs.readFileSync(rolesFilePath, 'utf8'));

    // 從反應中取得伺服器和成員物件
    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);

    // 檢查成員是否存在
    if (member) {
        // 在角色配置中尋找匹配的表情符號資料
        const matchedEmoji = rolesData.emojis.find(emojiData => emojiData.emojiId === reaction.emoji.id);

        // 如果找到匹配的表情符號
        if (matchedEmoji) {
            // 取得角色 ID 和相應的角色物件
            const roleId = matchedEmoji.roleId;
            const role = guild.roles.cache.get(roleId);

            // 如果角色物件存在，從成員中移除角色
            if (role) {
                member.roles.remove(role);
            }
        }
    }
}

// 匯出函式以供其他模組使用
export {
    addRoleFromReaction,
    removeRoleFromReaction
};
