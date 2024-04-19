// import { SlashCommandBuilder,PermissionFlagsBits } from 'discord.js';

// let dinnerlists = new Map();
// const dinnerlistPath = 'datapackge/fun/dinner.json';

// // 定義 Slash Command
// export const data = new SlashCommandBuilder()
//     .setName('music_add')
//     .setDescription('Add a song to the playlist')
//     .addStringOption(option =>
//         option.setName('吃啥')
//         .setDescription('新增菜單')
//         .setRequired(true))
//     .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

// // 執行 Slash Command

//     if (fs.existsSync(dinnerlistPath)) {
//         try {
//         const data = fs.readFileSync(dinnerlistPath, 'utf-8');
//         dinnerlists = new Map(Object.entries(JSON.parse(data)));
//         } catch (err) {
//         console.error('解析播放列表失败:', err);
//         }
//     }

//     const add = (guildId, songUrl) => {
//         const dinnerlist = dinnerlists.get(guildId) || [];
//         dinnerlist.push(songUrl);
//         dinnerlists.set(guildId, dinnerlist);
//         savePlaylists();
//     };

//     const jsonObject = Object.fromEntries(dinnerlists.entries());
//     fs.writeFileSync(dinnerlistPath, JSON.stringify(jsonObject));

