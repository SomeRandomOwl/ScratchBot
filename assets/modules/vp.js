const ytdl = require('ytdl-core');
const fs = require('fs')
const mkdirp = require('mkdirp')
downloadYoutubeAudio = function(url, callback) {
    const opts = {
        filter: "audioonly"
    };
    ytdl.getInfo(url, opts, function(err, info) {
        if (err) {
            //invalid youtube link?
            if (typeof callback === "function") {
                callback(err);
            }
        } else {
            //success! lets see if it has a supported format
            var extension = null;
            info.formats.some(function(format) {
                const formatRegex = /audio\/(\w+);/g;
                if (format && format.type) {
                    var match = formatRegex.exec(format.type);
                    if (match) {
                        extension = match[1];
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            });

            if (extension) {
                //found a supported format - let's save it
                mkdirp('./audio/', function(err) {
                    const path = `./audio/yt-${info.video_id}.${extension}`;
                })
                ytdl(url, opts).pipe(fs.createWriteStream(path)).on('finish', function() {
                    //download completed
                    if (typeof callback === "function") {
                        callback(null, path);
                    }
                });
            } else {
                //couldnt find supported format
                if (typeof callback === "function") {
                    callback("That link doesn't have a supported format!");
                }
            }
        }
    });
};
exports.play = function(bot, serverID, userID, channelID, url) {
    botVoicC = bot.servers[serverID].members[bot.id].voice_channel_id
    userVoiceC = bot.servers[serverID].members[userID].voice_channel_id

    if (botVoicC === undefined) {
        if (userVoiceC === undefined) {
            bot.sendMessage({
                to: channelID,
                message: 'You are not in a voice channel!',
                typing: false
            })
        } else {
            bot.joinVoiceChannel(userVoiceC)
        }
    } else {
        if (userVoiceC === undefined) {
            bot.sendMessage({
                to: channelID,
                message: 'You are not in a voice channel!',
                typing: false
            })
        } else if (botVoicC !== userVoiceC) {
            bot.joinVoiceChannel(userVoiceC)
        }
    }
    bot.sendMessage({
        to: channelID,
        message: 'That should play in a moment',
        typing: false
    }, function(error, response) {

        setTimeout(function() {
            bot.deleteMessage({
                channel: channelID,
                messageID: response.id
            })
        }, 1100)
    })
    setTimeout(function() {
        bot.getAudioContext({
            channel: userVoiceC,
            stereo: true
        }, function(stream) {
            downloadYoutubeAudio(url, function(err, file) {
                stream.playAudioFile(file);
            })
        })
    }, 1000)
}