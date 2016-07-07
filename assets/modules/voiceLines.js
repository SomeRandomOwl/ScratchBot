var fs = require('fs');
var vlJ = require('../voiceLines/voiceL.json')

function writeJSON(path, data, callback) {
    fs.writeFile(path + '.tmp', JSON.stringify(data, null, "\t"), function(error) {
        if (error) {
            return error;
        }
        fs.rename(path + '.tmp', path + '.json', function(error) {
            if (error) {
                return error;
            }
        });
    });
}

var util = require('util'),
    exec = require('child_process').exec,
    child

exports.list = function() {
    fs.readdir('./assets/voiceLines', function(err, files) {
        console.log(files)
        if (vlJ.shortNames === undefined) {
            vlJ.shortNames = {}
        }
        if (vlJ.nicknames === undefined) {
            vlJ.nicknames = []
        }
        if (vlJ.fileList === undefined) {
            vlJ.fileList = []
        }
        for (var fileN in files) {
            if (vlJ.shortNames[files[fileN]] === undefined && files[fileN].endsWith('.mp3')) {
                vlJ.shortNames[fileN] = {
                    'playCount': 0,
                    'nicknames': []
                }
                vlJ.fileList.push(files[fileN])
            } else {
                console.log('Not a mp3 ' + files[fileN])
                continue
            }
        }
        writeJSON('../voiceLines/voiceL.json', vlJ)
        exports.vlJ = vlJ
    })
}
exports.list()
exports.download = function(url) {
    if (url.endsWith('.mp3')) {
        child = exec('wget -nv ' + url,
            function(error, stdout, stderr) {
                return "File downloaded"
                exports.list()
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
    }
}
exports.nickname = function(file, name) {
    if (vlJ.nicknames.indexOf(name) === -1) {
        vlJ.shortNames[file].nicknames.push(name)
        vlJ.nicknames.push(name)
    } else {
        return "Nickname already Exists"
    }
}
exports.play = function(bot, serverID, userID, channelID, file) {
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
    setTimeout(function() {
        if (file.endsWith('.mp3')) {
            bot.getAudioContext({
                channel: userVoiceC,
                stereo: true
            }, function(stream) {
                stream.playAudioFile('./assets/voiceLines/' + file);
            })
        } else {
            if (vlJ.nicknames.indexOf(file) === -1) {
                bot.sendMessage({
                    to: userVoiceC,
                    message: 'That is not a file I recgonize!',
                    typing: false
                })
            } else {
                for (var fileN in vlJ.shortNames) {
                    if (vlJ.shortNames[fileN].nicknames.indexOf(file) !== -1) {
                        bot.getAudioContext({
                            channel: userVoiceC,
                            stereo: true
                        }, function(stream) {
                            stream.playAudioFile('./assets/voiceLines/' + fileN);
                        })
                    } else {
                        continue
                    }
                }

            }
        }
    }, 500)
}