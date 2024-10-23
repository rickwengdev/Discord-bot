import fs from 'fs';
import fetch from 'node-fetch';
import xml2js from 'xml2js';
import { EmbedBuilder } from 'discord.js';

// 設定 JSON 檔案路徑
const configPath = './followYTchannels.json';

// 讀取 JSON 檔案
function loadConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// 儲存 JSON 檔案
function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// 檢查 YouTube 頻道的最新影片
async function checkYouTubeRSS(guildId, ytChannelId, client) {
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${ytChannelId}`;
    try {
        const response = await fetch(RSS_URL);
        const rssText = await response.text();
        
        // 解析 RSS Feed
        xml2js.parseString(rssText, (err, result) => {
            if (err) {
                console.error('Error parsing RSS feed:', err);
                return;
            }

            const latestVideo = result.feed.entry[0];
            const videoId = latestVideo['yt:videoId'][0];
            const videoTitle = latestVideo.title[0];
            const videoLink = latestVideo.link[0].$.href;
            const videoThumbnail = latestVideo['media:group'][0]['media:thumbnail'][0].$.url;
            const videoPublished = latestVideo.published[0];

            const config = loadConfig();
            const ytChannelConfig = config[guildId]?.youtubeChannels?.[ytChannelId];
            const lastVideoId = ytChannelConfig?.lastVideoId;
            const discordChannelId = ytChannelConfig?.discordChannelId;

            // 如果有新影片，則發送通知並更新 JSON
            if (videoId !== lastVideoId) {
                const channel = client.channels.cache.get(discordChannelId);

                const videoEmbed = new EmbedBuilder()
                    .setTitle(videoTitle)
                    .setURL(videoLink)
                    .setImage(videoThumbnail)
                    .setTimestamp(new Date(videoPublished));

                channel.send({ embeds: [videoEmbed] });

                // 更新 JSON 檔案
                if (!config[guildId]) {
                    config[guildId] = { youtubeChannels: {} };
                }
                config[guildId].youtubeChannels[ytChannelId] = { 
                    lastVideoId: videoId, 
                    discordChannelId: discordChannelId
                };
                saveConfig(config);
            }
        });
    } catch (error) {
        console.error('Error fetching YouTube RSS feed:', error);
    }
}

// 開始追蹤 YouTube 頻道的更新
function startYouTubeFollowRSS(client) {
    const config = loadConfig();

    // 遍歷每個 guild 和其追蹤的頻道
    for (const guildId in config) {
        for (const ytChannelId in config[guildId].youtubeChannels) {
            setInterval(() => checkYouTubeRSS(guildId, ytChannelId, client), 60000); // 每分鐘檢查一次
        }
    }
}

export{
    startYouTubeFollowRSS
};