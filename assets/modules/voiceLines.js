var fs = require('fs');
var vlJ = require('../voiceLines/voiceL.json')
var newFiles = []

module.exports = function(bot, storage, config) {
    const module = {};

    module.leaveAll = function(bot) {
        for (var i = vlJ.joinedChannels.length - 1; i >= 0; i--) {
            bot.leaveVoiceChannel(vlJ.joinedChannels[i])
        }
    }

    function writeJSON(path, data, callback) {
        fs.writeFile(path + '.tmp', JSON.stringify(data, null, "\t"), function(error) {
            if (error) {
                console.log(error);
            }
            fs.rename(path + '.tmp', path + '.json', function(error) {
                if (error) {
                    console.log(error);
                }
            });
        });
    }

    var util = require('util'),
        exec = require('child_process').exec,
        child

    module.list = function() {
        fs.readdir('./assets/voiceLines', function(err, files) {
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
                    vlJ.shortNames[files[fileN]] = {
                        'playCount': 0,
                        'nicknames': []
                    }
                    vlJ.fileList.push(files[fileN])
                    newFiles.push(files[fileN])
                } else {
                    //console.log('Not a mp3 ' + files[fileN])
                    continue
                }
            }
            writeJSON('./assets/voiceLines/voiceL', vlJ)
            module.vlJ = vlJ
            module.newFiles = newFiles
        })
    }
    module.list()
    module.download = function(url) {
        if (url.endsWith('.mp3')) {
            child = exec('wget -nv ' + url,
                function(error, stdout, stderr) {
                    return "File downloaded"
                    module.list()
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });
        }
    }
    module.nickname = function(file, name, bot, channelID) {
        if (vlJ.nicknames.indexOf(name) === -1) {
            vlJ.shortNames[file].nicknames.push(name)
            vlJ.nicknames.push(name)
            writeJSON('./assets/voiceLines/voiceL', vlJ)
            bot.sendMessage({
                to: channelID,
                message: 'OK! added a new nickname for: ' + file + ' Nickname: ' + name,
                typing: false
            })
        } else {
            return "Nickname already Exists"
        }
    }
    module.play = function(bot, serverID, userID, channelID, file) {
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
                vlJ.joinedChannels.push(userVoiceC)
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
                vlJ.joinedChannels.push(userVoiceC)
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

        }, 1000)
    }
}