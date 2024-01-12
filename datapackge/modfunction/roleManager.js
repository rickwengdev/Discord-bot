import fs from 'fs';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const addRoleFromReaction = (reaction, user) => {
    const rolesFilePath = path.join(__dirname, 'roles.json');
    const rolesData = JSON.parse(fs.readFileSync(rolesFilePath, 'utf8'));

    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);

    if (member) {
        const matchedEmoji = rolesData.emojis.find(emojiData => emojiData.emojiId === reaction.emoji.id);

        if (matchedEmoji) {
            const roleId = matchedEmoji.roleId;
            const role = guild.roles.cache.get(roleId);

            if (role) {
                member.roles.add(role)
                .catch(error => {
                    console.error(`Error adding role: ${error.message}`);
                });
            }
        }
    }
}

const removeRoleFromReaction = (reaction, user) => {
    const rolesFilePath = path.join(__dirname, 'roles.json');
    const rolesData = JSON.parse(fs.readFileSync(rolesFilePath, 'utf8'));

    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);

    if (member) {
        const matchedEmoji = rolesData.emojis.find(emojiData => emojiData.emojiId === reaction.emoji.id);

        if (matchedEmoji) {
            const roleId = matchedEmoji.roleId;
            const role = guild.roles.cache.get(roleId);

            if (role) {
                member.roles.remove(role)
            }
        }
    }
}

export {
    addRoleFromReaction,
    removeRoleFromReaction
};