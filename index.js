/* Welcome, this is scratch bots source code, everything that makes her run and tick! */
var DiscordClient = require('discord.io');
var winston = require('winston');
var config = require('../../config.json');
var fs = require('fs');
var Roll = require('roll');
roll = new Roll();
var math = require('mathjs');
var readline = require('readline');
var YouTube = require('youtube-node');
var youTube = new YouTube();
var moment = require('moment');
var xkcd = require('xkcd-imgs');
var chalk = require('chalk');
var request = require('request');
var mkdirp = require('mkdirp');
var doc = require('./assets/doc.json')
var Cleverbot = require('cleverbot-node');
var pirateSpeak = require('pirate-speak');
var google = require('googleapis');
var urlshortener = google.urlshortener('v1');

cleverbot = new Cleverbot;

/*/Set up logging/*/
var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            name: 'info-file',
            filename: './logs/filelog-info.log',
            level: 'info'
        }),
        new(winston.transports.File)({
            name: 'error-file',
            filename: './logs/filelog-error.log',
            level: 'error',
            // handleExceptions: true,
            // humanReadableUnhandledException: true
        })
    ]
});
var story = new(winston.Logger)({
    levels: {
        space: 0,
        unknown: 1,
        laderis: 2,
    },
    transports: [
        new(winston.transports.File)({
            name: 'stoey-file',
            filename: './logs/story.log',
            level: 'laderis'
        }),
    ]
});

/*/Loads Storage.json if it exists/*/
if (fs.existsSync('./assets/storage.json')) {
    logger.info(chalk.gray('Found Storage.json'));
    var storage = require('./assets/storage.json')
} else
if (fs.existsSync('./assets/storage.json') === false) {
    logger.info(chalk.underline.red('Didnt Find Storage.json, Please run generateStorageFile.js'))
}

/*/Load Up a Youtube Api Key /*/
youTube.setKey(config.youTubeApiKey);
/*/Bot credentials/*/
var bot = new DiscordClient({
    autorun: true,
    //email: config.email,
    //password: config.pass,
    token: config.token
});

/* Global variable setting */
var cnaid = '171798432749584387'
var dateFormat = 'MMMM Do YYYY, h:mm:ss a'
var lastseen = null
var logChan = config.logChan;
var sentPrevId = null;
var commandmod = config.cmdMod;
var ownerId = config.ownerId;
var rconcmd = 'No';
var clist = doc.cList
var debug = false;
var serverID = null;
var xkcdJson = null
var verb = false
var prevUrl

String.prototype.replaceBetween = function(start, end, what) {
    return this.substring(0, start) + what + this.substring(end);
};

/* Start of function defining */
if (storage.settings.redditList === undefined) {
    storage.settings.redditList = []
    redditList = storage.settings.redditList
} else {
    redditList = storage.settings.redditList
}
/*/Function to write json to the storage file/*/
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
/*/Quick way of checking if something is in a array/*/
function isInArray(value, array) {
    return array.indexOf(value) > -1;
}
/*/Converts Seconds to hh mm ss/*/
function secondsToTime(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var days = Math.floor(hours / 24)
    while (hours > 24) {
        hours = hours - 24
    }
    var obj = {
        "d": days,
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}
/*/Gets seconds using Date.now()/*/
function gettime() {
    var timenow = Math.floor(Date.now() / 1000)
    return timenow
}
/*/Lists currently connected severs and writes them to json/*/
function serverlist(verb, s) {
    serverCnt = 0
    if (verb) {
        logger.info(chalk.underline("Currently connected to these servers:\n"))
    }
    for (var serverID in bot.servers) {
        serverCnt++
        if (verb) {
            console.log(bot.servers[serverID].name)
        }
        var name = bot.servers[serverID].name;
        var SownerId = bot.servers[serverID].owner_id
        if (storage.d.Servers[name] === undefined) {
            storage.d.Servers[name] = {
                'id': serverID,
                'messageCnt': 0,
                'settings': {
                    'announceChan': null,
                    'verb': false,
                },
                'SownerId': SownerId,
                'Channels': {}
            }
        } else {
            if (storage.d.Servers[name].messageCnt === undefined) {
                storage.d.Servers[name].messageCnt = 0
            }
            if (storage.d.Servers[name].settings.announceChan === undefined) {
                storage.d.Servers[name].settings.announceChan = null
            }
            if (storage.d.Servers[name].SownerId === undefined) {
                storage.d.Servers[name].SownerId = SownerId
            }
        }
    }
    if (s) {
        console.log(chalk.gray("Currently connected to: " + serverCnt + " Servers"))
    }
    storage.d.totalCounters.servers = serverCnt
    writeJSON('./assets/storage', storage)
}
/*/Lists currencly seen channels/*/
function channellist(verb, s) {
    channelCnt = 0
    if (verb) {
        logger.info(chalk.underline("Currently connected to these channels:\n"))
    }
    for (var serverID in bot.servers) {
        for (var channelID in bot.servers[serverID].channels) {
            channelCnt++
            if (verb) {
                console.log(bot.servers[serverID].channels[channelID].name)
            }
            var name = bot.servers[serverID].channels[channelID].name;
            var type = bot.servers[serverID].channels[channelID].type;
            var sname = bot.servers[serverID].name
            if (storage.d.Servers[sname].Channels[name] === undefined) {
                storage.d.Servers[sname].Channels[name] = {
                    "id": channelID,
                    "type": type,
                    "messageCnt": 0,
                }
            } else {
                storage.d.Servers[sname].Channels[name].id = channelID
                storage.d.Servers[sname].Channels[name].type = type
                if (type !== "voice") {
                    if (storage.d.Servers[sname].Channels[name].messageCnt === undefined) {
                        storage.d.Servers[sname].Channels[name].messageCnt = 0
                    }
                    if (storage.d.Servers[sname].Channels[name].lastComicActt === undefined) {
                        storage.d.Servers[sname].Channels[name].lastComicActt = 0
                    }
                    if (storage.d.Servers[sname].Channels[name].lastComic === undefined) {
                        storage.d.Servers[sname].Channels[name].lastComic = 0
                    }
                    if (storage.d.Servers[sname].Channels[name].lastComicActt === null) {
                        storage.d.Servers[sname].Channels[name].lastComicActt = 0
                    }
                    if (storage.d.Servers[sname].Channels[name].lastComic === null) {
                        storage.d.Servers[sname].Channels[name].lastComic = 0
                    }
                }
            }
        }
    }
    if (s) {
        console.log(chalk.gray("With a total of: " + channelCnt + " Channels"))
    }
    storage.d.totalCounters.channels = channelCnt
    writeJSON('./assets/storage', storage)
}
/*/List currently seen users/*/
function userlist(verb, s) {
    userCnt = 0
    if (verb) {
        logger.info(chalk.underline("Currently seeing these users:\n"))
    }
    for (var serverID in bot.servers) {
        for (var userID in bot.servers[serverID].members) {
            userCnt++
            if (verb) {
                console.log(bot.servers[serverID].members[userID].username)
            }
            var name = bot.servers[serverID].members[userID].username;
            if (storage.d.Users[name] === undefined) {
                storage.d.Users[name] = {
                    "id": userID,
                    "messageCnt": 0,
                    "linkCnt": 0,
                    "status": "unknown",
                    "lastseen": "unknown",
                    "rawLastSeen": 0
                }
            } else {
                if (storage.d.Users[name].messageCnt === undefined) {
                    storage.d.Users[name].messageCnt = 0
                }
                if (storage.d.Users[name].linkCnt === undefined) {
                    storage.d.Users[name].linkCnt = 0
                }
                if (storage.d.Users[name].status === undefined) {
                    storage.d.Users[name].status = "Unknown"
                }
                if (storage.d.Users[name].lastseen === undefined) {
                    storage.d.Users[name].lastseen = "Unknown"
                }
                if (storage.d.Users[name].rawLastSeen === undefined) {
                    storage.d.Users[name].rawLastSeen = 0
                }
                if (storage.d.Users[name].totalIdle === undefined) {
                    storage.d.Users[name].totalIdle = {
                        'd': 0,
                        'h': 0,
                        'm': 0,
                        's': 0
                    }
                }
                if (storage.d.Users[name].totalOffline === undefined) {
                    storage.d.Users[name].totalOffline = {
                        'd': 0,
                        'h': 0,
                        'm': 0,
                        's': 0
                    }
                }
                if (storage.d.Users[name].Servers === undefined) {
                    storage.d.Users[name].Servers = []
                }
                if (isInArray(bot.servers[serverID].name, storage.d.Users[name].Servers)) {
                    continue
                } else {
                    storage.d.Users[name].Servers.push(bot.servers[serverID].name)
                }
            }
        }
    }
    if (s) {
        console.log(chalk.gray("With approximatly: " + userCnt + " Users across all of them\n"))
    }
    storage.d.totalCounters.users = userCnt
    writeJSON('./assets/storage', storage)
}
/*/Used to Ignore Channels/*/
function ignoreC(cID) {
    try {
        storage.settings.ignoredChannels.push(cID)
        return true
    } catch (e) {
        return false
    }
}
/*/Used to unignore channels/*/
function uningoreC(cID) {
    try {
        array = storage.settings.ignoredChannels
        var index = array.indexOf(cID)
        if (index > -1) {
            array.splice(index, 1);
        }
        return true
    } catch (e) {
        return false
    }
}
/*/YouTube Search/*/
function yt(ytcall, userID, channelID) {
    youTube.search(ytcall, 1, function(error, result) {
        if (error) {
            logger.error(chalk.red(error));
        } else {
            try {
                if (result.items[0].id.kind === 'youtube#video') {
                    var description = result.items[0].snippet.description
                    while (description.indexOf('http') !== -1) {
                        description = description.replace('http://', '')
                        description = description.replace('https://', '')
                    }

                    messageSend(channelID, '\nTitle: ' + result.items[0].snippet.title + ';\n\nDescription: ' + description + ';\nVideo: https://youtu.be/' + result.items[0].id.videoId + ' ;', true, 'css')
                } else if (result.items[0].id.kind === 'youtube#channel') {
                    var description = result.items[0].snippet.description
                    while (description.indexOf('http') !== -1) {
                        description = description.replace('http://', '')
                        description = description.replace('https://', '')
                    }
                    messageSend(channelID, '\nTitle: ' + result.items[0].snippet.title + ';\n\nDescription: ' + description + ';\nChannel: https://www.youtube.com/channel/' + result.items[0].id.channelId + ' ;', true, 'css')
                } else if (result.items[0].id.kind === 'youtube#playlist') {
                    var description = result.items[0].snippet.description
                    while (description.indexOf('http') !== -1) {
                        description = description.replace('http://', '')
                        description = description.replace('https://', '')
                    }
                    messageSend(channelID, '\nTitle: ' + result.items[0].snippet.title + ';\n\nDescription: ' + description + ';\nPlaylist: https://www.youtube.com/playlist?list=' + result.items[0].id.playlistId + ' ;', true, 'css')
                } else {
                    messageSend(channelID, '<@' + userID + '> Sorry I could not retrieve that :confused:')
                }
            } catch (e) {
                logger.error("Youtube Fetch Failed " + e + " | " + ytcall)
                messageSend(channelID, '<@' + userID + '> Sorry I could not retrieve that :confused:')
                logger.error(chalk.red(e))
            }
        }
    });
}
/*/Used to change status message/*/
function statusmsg(msg) {
    bot.setPresence({
        idle_since: null,
        game: msg
    })
}
/*/Used to send messages and keep tack of the message id/*/
function messageSend(channelID, msg, cb, type, mention, userID, preText) {
    try {
        sId = bot.serverFromChannel(channelID)
        for (var sname in storage.d.Servers) {
            if (storage.d.Servers[sname].id === sId) {
                if (storage.d.Servers[sname].settings.pirate === true) {
                    var msg = pirateSpeak.translate(msg);
                }
            } else {
                continue
            }
        }
    } catch (e) {
        //
    }
    if (mention === true && cb === false) {
        msg = msg + ' <@' + userID + '>\n'
    }
    if (cb === true) {
        if (type !== undefined) {
            if (mention === true) {
                if (type === 'json') {
                    msg = JSON.stringify(msg, null, '\t')
                }
                if (preText !== undefined) {
                    msg = '<@' + userID + '>' + preText + '\n\n```' + type + '\n' + msg + '```'
                } else {
                    msg = '<@' + userID + '>\n\n```' + type + '\n' + msg + '```'
                }
            } else {
                if (type === 'json') {
                    msg = JSON.stringify(msg, null, '\t')
                }
                if (preText !== undefined) {
                    msg = preText + '\n\n```' + type + '\n' + msg + '```'
                } else {
                    msg = '\n\n```' + type + '\n' + msg + '```'
                }
            }
        } else {
            if (mention === true) {
                if (preText !== undefined) {
                    msg = '<@' + userID + '>' + preText + '\n\n```' + msg + '```'
                } else {
                    msg = '<@' + userID + '>\n\n```' + msg + '```'
                }
            } else {
                if (preText !== undefined) {
                    msg = preText + '\n\n```' + msg + '```'
                } else {
                    msg = '\n\n```' + msg + '```'
                }
            }
        }
    }
    bot.sendMessage({
        to: channelID,
        message: msg,
        typing: false
    }, function(error, response) {
        if (error) {
            console.log(error)
            console.log(channelID)
            console.log(msg)
        }
        try {
            logger.info(chalk.gray('Last Message Sent ID: ' + response.id))
            sentPrevId = response.id
        } catch (e) {
            return
        }
    });
    return sentPrevId
}
/*/Console related input functions/*/
function consoleparse(line) {
    if (line.toLowerCase().indexOf('~') === 0) {
        if (line.toLowerCase().indexOf('cnaid') === 1) {
            cnaid = line.replace('~cnaid ', '')
            logger.info(chalk.gray("Now talking in channel: " + cnaid))
        } else if (line.toLowerCase().indexOf('cnch') === 1) {
            var channe = line.substring(line.indexOf(' ') + 1)
            for (var server in storage.d.Servers) {
                for (var channel in storage.d.Servers[server].Channels) {
                    if (channel === channe) {
                        cnaid = storage.d.Servers[server].Channels[channel].id
                        console.log("Now talking in: " + channel + "/" + cnaid)
                    } else {
                        continue
                    }
                }
            }
        } else {
            try {
                eval(line)
            } catch (e) {
                logger.error(chalk.red("Bad JS Command " + e))
            }
        }
    } else if (line.toLowerCase().indexOf('~') !== 0) {
        bot.sendMessage({
            to: cnaid,
            message: line,
            typeing: true
        })
    }
}
/*/Rolls dice/*/
function diceroll(dice, userID, channelID) {
    if (dice.indexOf('d') === 0) {
        var dienum = roll.roll(dice);
        messageSend(channelID, '<@' + userID + '>' + ' rolled: ' + dienum.rolled.toString())
    }
    //This is if theres more than one die thrown
    if (dice.indexOf('d') !== 0 && dice.indexOf('d') != -1) {
        var numdie = dice.substring(0, dice.toLowerCase().indexOf('d'))
            //This is to limit the number of die thrown
        if (numdie < 21) {
            var dienum = roll.roll(dice);
            messageSend(channelID, '<@' + userID + '>' + ' rolled: ' + dienum.rolled.toString() + ' For a total of: ' + dienum.result)
        } else if (numdie > 21) {
            messageSend(channelID, '<@' + userID + '>' + ' Please roll no more than 20 dice')
        }
    }
    //If now die are thrown toss this
    if (dice.indexOf('d') === -1) {
        messageSend(channelID, '<@' + userID + '>' + ' How can i roll a die with no dice to roll? :disappointed:')
    }
}
/*/Retrieves a relavant xkcd comic from a query/*/
function relxkcd(quer, channelID, name, sname) {
    var comictime = gettime()
    try {
        lastcomictime = storage.d.Servers[sname].Channels[name].lastComic
        elapsed = comictime - lastcomictime
        elapsed = secondsToTime(elapsed)
        comicacttime = storage.d.Servers[sname].Channels[name].lastComicActt
        nextTime = lastcomictime + 3600
        nextTime = nextTime - comictime
        nextTime = secondsToTime(nextTime)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        console.log("Comic elapsed: " + JSON.stringify(elapsed))
    } catch (e) {
        console.log(e)
        storage.d.Servers[sname].Channels[name].lastComic = 0
        storage.d.Servers[sname].Channels[name].lastComicActt = 0
    }
    if (elapsed.h > 0) {
        var comicacttime = moment().format('h:mm a')
        storage.d.Servers[sname].Channels[name].lastComicActt = comicacttime
        request('https://relevantxkcd.appspot.com/process?action=xkcd&query=' + quer, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                comicnum = body.substring(body.indexOf('\n0') + 4, body.indexOf(' /'))
                precent = body.substring(body.indexOf('\n'))
                request('http://xkcd.com/' + comicnum + '/info.0.json', function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        xkcdJson = JSON.parse(body)
                        messageSend(channelID, xkcdJson.title + '\n ```' + xkcdJson.alt + '```\n' + xkcdJson.img)
                        return elapsed
                    }
                })
            }
        })
        var lastcomictime = gettime()
        storage.d.Servers[sname].Channels[name].lastComic = lastcomictime
    } else {
        try {
            if (comicacttime === undefined) {
                messageSend(channelID, "Sorry there was some sort of error, should be fixed now, try again")
                storage.d.Servers[sname].Channels[name].lastComic = 0
                storage.d.Servers[sname].Channels[name].lastComicActt = 0
            }
        } catch (e) {
            e = e
        }
        messageSend(channelID, ":no_entry: Hey hold up, only one comic per hour, last comic was posted: " + comicacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    writeJSON('./assets/storage', storage)
}
/*/Retrieves a current status of a user/*/
function status(statuscall, channelID, rawEvent) {
    try {
        if (statuscall.toLowerCase().indexOf('<@') === -1) {
            var status = storage.d.Users[statuscall].status
            if (status === 'idle') {
                rawLastSeen = storage.d.Users[statuscall].rawLastSeen
                var ltsmsg = storage.d.Users[statuscall].lastseen
                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).format('MMMM Do YYYY, h:mm:ss a')
                var timeIdle = gettime() - rawLastSeen
                timeIdle = secondsToTime(timeIdle)
                if (timeIdle.h === 0) {
                    timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                } else if (timeIdle.h === 1) {
                    if (timeIdle.d === 0) {
                        timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else if (timeIdle.d === 1) {
                        timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else {
                        timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    }
                } else {
                    if (timeIdle.d === 0) {
                        timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else if (timeIdle.d === 1) {
                        timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else {
                        timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    }
                }
                messageSend(channelID, statuscall + " Is currently " + storage.d.Users[statuscall].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
            } else if (status === 'offline') {
                rawLastSeen = storage.d.Users[statuscall].rawLastSeen
                var ltsmsg = storage.d.Users[statuscall].lastseen
                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).format('MMMM Do YYYY, h:mm:ss a')
                var timeIdle = gettime() - rawLastSeen
                timeIdle = secondsToTime(timeIdle)
                if (timeIdle.h === 0) {
                    timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                } else if (timeIdle.h === 1) {
                    if (timeIdle.d === 0) {
                        timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else if (timeIdle.d === 1) {
                        timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else {
                        timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    }
                } else {
                    if (timeIdle.d === 0) {
                        timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else if (timeIdle.d === 1) {
                        timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    } else {
                        timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                    }
                }
                messageSend(channelID, statuscall + " Is currently " + storage.d.Users[statuscall].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
            } else if (status === 'online') {
                messageSend(channelID, statuscall + " Is currently online")
            } else if (status === 'Unknown') {
                messageSend(channelID, "Oh...um, i dont know the last time " + statuscall + " was online...sorry :confounded:")
            }
        } else {
            var mentId = rawEvent.d.mentions[0].id
            for (var usern in storage.d.Users) {
                if (mentId === storage.d.Users[usern].id) {
                    var status = storage.d.Users[usern].status
                    if (status === 'idle') {
                        rawLastSeen = storage.d.Users[usern].rawLastSeen
                        var ltsmsg = storage.d.Users[usern].lastseen
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).format('MMMM Do YYYY, h:mm:ss a')
                        var timeIdle = gettime() - rawLastSeen
                        timeIdle = secondsToTime(timeIdle)
                        if (timeIdle.h === 0) {
                            timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        } else if (timeIdle.h === 1) {
                            if (timeIdle.d === 0) {
                                timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else if (timeIdle.d === 1) {
                                timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else {
                                timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            }
                        } else {
                            if (timeIdle.d === 0) {
                                timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else if (timeIdle.d === 1) {
                                timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else {
                                timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            }
                        }
                        messageSend(channelID, statuscall + " Is currently " + storage.d.Users[usern].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
                    } else if (status === 'offline') {
                        rawLastSeen = storage.d.Users[usern].rawLastSeen
                        var ltsmsg = storage.d.Users[usern].lastseen
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).format('MMMM Do YYYY, h:mm:ss a')
                        var timeIdle = gettime() - rawLastSeen
                        timeIdle = secondsToTime(timeIdle)
                        if (timeIdle.h === 0) {
                            timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        } else if (timeIdle.h === 1) {
                            if (timeIdle.d === 0) {
                                timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else if (timeIdle.d === 1) {
                                timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else {
                                timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            }
                        } else {
                            if (timeIdle.d === 0) {
                                timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else if (timeIdle.d === 1) {
                                timeIdle = timeIdle.d + " Day " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            } else {
                                timeIdle = timeIdle.d + " Days " + timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                            }
                        }
                        messageSend(channelID, statuscall + " Is currently " + storage.d.Users[usern].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
                    } else if (status === 'online') {
                        messageSend(channelID, statuscall + " Is currently online")
                    } else if (status === 'Unknown') {
                        messageSend(channelID, "Oh...um, i dont know the last time " + statuscall + " was online...sorry :confounded:")
                    }
                } else {
                    continue
                }
            }
        }
    } catch (e) {
        console.log(e)
        messageSend(channelID, "Error; No User specified, or invalid user")
    }
}
/*/Posts a random cat picture, limit 1 per hour/*/
function cat(channelID, name, sname) {
    var cattime = gettime()
    if (storage.d.Servers[sname].Channels[name].lastCat === undefined) {
        storage.d.Servers[sname].Channels[name].lastCat = 0
        storage.d.Servers[sname].Channels[name].lastCatActt = 0
    }
    try {
        lastcattime = storage.d.Servers[sname].Channels[name].lastCat
        elapsed = cattime - lastcattime
        nextTime = lastcattime + 3600
        nextTime = nextTime - cattime
        nextTime = secondsToTime(nextTime)
        elapsed = secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        catacttime = storage.d.Servers[sname].Channels[name].lastCatActt
    } catch (e) {
        storage.d.Servers[sname].Channels[name].lastCat = 0
        storage.d.Servers[sname].Channels[name].lastCatActt = 0
    }
    if (elapsed.h > 0) {
        var catacttime = moment().format('h:mm a')
        storage.d.Servers[sname].Channels[name].lastCatActt = catacttime
        request('http://random.cat/meow', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                catJson = JSON.parse(body)
                messageSend(channelID, "Heres a cat! " + catJson.file)
                return elapsed
            }
        })
        var lastcattime = gettime()
        storage.d.Servers[sname].Channels[name].lastCat = lastcattime
    } else {
        messageSend(channelID, ":no_entry: Hey hold up, only one cat per hour, last cat was posted: " + catacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    writeJSON('./storage', storage)
}
/*/Posts a random snake picture, limit 1 per hour/*/
function snake(channelID, name, sname, userID) {
    var snaketime = gettime()
    if (storage.d.Servers[sname].Channels[name].lastsnake === undefined) {
        storage.d.Servers[sname].Channels[name].lastsnake = 0
        storage.d.Servers[sname].Channels[name].lastsnakeActt = 0
    }
    try {
        lastsnaketime = storage.d.Servers[sname].Channels[name].lastsnake
        elapsed = snaketime - lastsnaketime
        nextTime = lastsnaketime + 3600
        nextTime = nextTime - snaketime
        nextTime = secondsToTime(nextTime)
        elapsed = secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        snakeacttime = storage.d.Servers[sname].Channels[name].lastsnakeActt
    } catch (e) {
        storage.d.Servers[sname].Channels[name].lastsnake = 0
        storage.d.Servers[sname].Channels[name].lastsnakeActt = 0
    }
    if (elapsed.h > 0) {
        var snakeacttime = moment().format('h:mm a')
        storage.d.Servers[sname].Channels[name].lastsnakeActt = snakeacttime
        request('http://fur.im/snek/snek.php', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                snakeJson = JSON.parse(body)
                messageSend(channelID, "Heres a snake! " + snakeJson.file)
                return elapsed
            }
        })
        var lastsnaketime = gettime()
        storage.d.Servers[sname].Channels[name].lastsnake = lastsnaketime
    } else if (userID.indexOf('142484312862752768') !== -1) {
        request('http://fur.im/snek/snek.php', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                snakeJson = JSON.parse(body)
                messageSend(channelID, "Heres a snake for you william! " + snakeJson.file)
            }
        })
    } else {
        messageSend(channelID, ":no_entry: Hey hold up, only one snake per hour, last snake was posted: " + snakeacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    writeJSON('./assets/storage', storage)
}
/*/Posts a random pug picture, limit 1 per hour/*/
function pug(channelID, name, sname) {
    var pugtime = gettime()
    if (storage.d.Servers[sname].Channels[name].lastpug === undefined) {
        storage.d.Servers[sname].Channels[name].lastpug = 0
        storage.d.Servers[sname].Channels[name].lastpugActt = 0
    }
    try {
        lastpugtime = storage.d.Servers[sname].Channels[name].lastpug
        elapsed = pugtime - lastpugtime
        nextTime = lastpugtime + 3600
        nextTime = nextTime - pugtime
        nextTime = secondsToTime(nextTime)
        elapsed = secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        pugacttime = storage.d.Servers[sname].Channels[name].lastpugActt
    } catch (e) {
        storage.d.Servers[sname].Channels[name].lastpug = 0
        storage.d.Servers[sname].Channels[name].lastpugActt = 0
    }
    if (elapsed.h > 0) {
        var pugacttime = moment().format('h:mm a')
        storage.d.Servers[sname].Channels[name].lastpugActt = pugacttime
        request('http://pugme.herokuapp.com/bomb?count=1', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                pugJson = JSON.parse(body)
                messageSend(channelID, "Heres a pug! " + pugJson.pugs[0])
                return elapsed
            }
        })
        var lastpugtime = gettime()
        storage.d.Servers[sname].Channels[name].lastpug = lastpugtime
    } else {
        messageSend(channelID, ":no_entry: Hey hold up, only one pug per hour, last pug was posted: " + pugacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    writeJSON('./assets/storage', storage)
}
/*/Posts a random image from a SFW scenery subreddit/*/
function redditScenery(channelID, reddit, name, sname) {
    if (isInArray(reddit, redditList)) {
        var notif = messageSend(channelID, "Grabbing a image from reddit, this might take a few seconds...")
        request('https://www.reddit.com/r/' + reddit + 'porn' + '.json', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                redditJson = JSON.parse(body)
                posts = redditJson.data.children
                redditP = posts[Math.floor(Math.random() * posts.length)];
                img = redditP.data.url
                title = redditP.data.title
                messageDelete(channelID, sentPrevId)
                messageSend(channelID, title + '\n' + img)
            }
        })
    } else {
        messageSend(channelID, "Not a recgonized image subreddit to see recgonized reddits type " + commandmod + "redditscenery list")
    }
    writeJSON('./assets/storage', storage)
}
/*/Help command/*/
function help(cmd, channelID) {
    if (help) {
        try {
            messageSend(channelID, doc.help[cmd].type + " command; " + doc.help[cmd].help)
        } catch (e) {
            messageSend(channelID, "That isn't a recgonized command, or there is no help documentation on it")
        }
    }
}
/*/Quick way to delete a message/*/
function messageDelete(channelID, messageID) {
    bot.deleteMessage({
        channel: channelID,
        messageID: messageID
    })
}
/*/Dekete multiple messages/*/
function messagesDelete(channelID, number) {
    bot.getMessages({
        channel: channelID,
        limit: number
    }, function(error, messageArr) {
        if (error) returnconsole.log(error);
        var array = []
        for (var i = 0; i < number + 1 && i < array.length; i++) {
            array.push(messageArr[i].id)
        }
        console.log(array.length)
        bot.deleteMessages({
            channelID: channelID,
            messageIDs: array
        })

    });
}
/*/Magic 8 Ball/*/
function eightBall(channelID, question, userID) {
    var resp = doc.eBall[Math.floor(Math.random() * doc.eBall.length)];
    messageSend(channelID, '<@' + userID + '> ' + resp)
}
/*/Ask cleverbot a question/*/
function clever(channelID, userID, msg) {
    /*cBot.ask(question, function(err, response) {
        if (err) {
            console.log(err)
        } else {
            messageSend(channelID, response);
        }
    });*/
    Cleverbot.prepare(function() {
        cleverbot.write(msg, function(response) {
            try {
                messageSend(channelID, "<@" + userID + ">: " + response.message)
            } catch (err) {
                console.log(err)
            }
        });
    });
}
/*/Unshortens urls/*/
function unShorten(channelID, userID, url) {
    try {
        request('http://api.unshorten.it?shortURL=' + url + '&responseFormat=json&return=both&apiKey=' + config.unShorten, function(error, response, body) {
            body = JSON.parse(body)
            console.log(body)
            if (body.domain !== undefined) {
                messageSend(channelID, '<@' + userID + '> The url you gave leads to: ' + body.domain + ' And more specifically this page: ' + body.fullurl)
            } else if (body.error !== undefined) {
                messageSend(channelID, '<@' + userID + '> invalid url!')
            }
        })
    } catch (e) {
        messageSend(channelID, '<@' + userID + '> you either provided no url or a invalid url!')
    }
}
/*/Prints out a users stats/*/
function stats(channelID, name, rawEvent, channelID, serverID) {
    /*try {*/
    if (name.toLowerCase().indexOf('<@') === -1) {
        console.log('this')
        statW = whoIs(channelID, serverID, name, true)
        wLink = statW.substring(statW.indexOf('"h') + 1, statW.indexOf('g"') + 1)
        whoRest = statW.substring(0, statW.indexOf('Avatar'))
        request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + wLink + '&access_token=' + config.bitLy, function(error, response, body) {
            body = JSON.parse(body)
            thing = whoRest + 'Avatar:    "' + body.data.url + '"'

            messageSend(channelID, thing + "\n\n" +
                "Messages Sent:       " + storage.d.Users[name].messageCnt + '\n' +
                "Links Sent:          " + storage.d.Users[name].linkCnt + '\n' +
                "Total Time Idle:     " + storage.d.Users[name].totalIdle.d + " Days " + storage.d.Users[name].totalIdle.h + " Hours " + storage.d.Users[name].totalIdle.m + " Minutes " + storage.d.Users[name].totalIdle.s + " Seconds\n" +
                "Total Time Offline:  " + storage.d.Users[name].totalOffline.d + " Days " + storage.d.Users[name].totalOffline.h + " Hours " + storage.d.Users[name].totalOffline.m + " Minutes " + storage.d.Users[name].totalOffline.s + " Seconds", true, 'xl')
        })
    } else {
        console.log('that')
        var name = rawEvent.d.mentions[0].username
            /*for (var usern in storage.d.Users) {
            if (mentId === storage.d.Users[usern].id) {*/
        statW = whoIs(channelID, serverID, name, true)
        wLink = statW.substring(statW.indexOf('"h') + 1, statW.indexOf('g"') + 1)
        whoRest = statW.substring(0, statW.indexOf('Avatar'))
        request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + wLink + '&access_token=' + config.bitLy, function(error, response, body) {
            body = JSON.parse(body)
            thing = whoRest + 'Avatar:    "' + body.data.url + '"'

            messageSend(channelID, thing + "\n\n" +
                "Messages Sent:       " + storage.d.Users[name].messageCnt + '\n' +
                "Links Sent:          " + storage.d.Users[name].linkCnt + '\n' +
                "Total Time Idle:     " + storage.d.Users[name].totalIdle.d + " Days " + storage.d.Users[name].totalIdle.h + " Hours " + storage.d.Users[name].totalIdle.m + " Minutes " + storage.d.Users[name].totalIdle.s + " Seconds\n" +
                "Total Time Offline:  " + storage.d.Users[name].totalOffline.d + " Days " + storage.d.Users[name].totalOffline.h + " Hours " + storage.d.Users[name].totalOffline.m + " Minutes " + storage.d.Users[name].totalOffline.s + " Seconds", true, 'xl')
        })
        /*} else {
                continue
            }
        }*/
    }
    /*} catch (e) {
        console.log(e)
        messageSend(channelID, "Error; No User specified, or invalid user")
    }*/
}
/*/WhoIs/*/
function whoIs(channelID, serverID, name, cl) {
    try {
        userID = storage.d.Users[name].id
        roles = bot.servers[serverID].members[userID].roles
        nick = bot.servers[serverID].members[userID].nick
        mute = bot.servers[serverID].members[userID].mute
        deaf = bot.servers[serverID].members[userID].deaf
        join = bot.servers[serverID].members[userID].joined_at
        status = bot.servers[serverID].members[userID].status
        userN = bot.users[userID].username
        discriminator = bot.users[userID].discriminator
        avatar = bot.users[userID].avatar
        botT = bot.users[userID].bot
        game = bot.users[userID].game
        botT = JSON.stringify(botT)
    } catch (e) { /**/ }

    if (roles.length !== 0) {
        rolesm = 'everyone, '
        for (var i = 0; i < roles.length; i++) {
            if (i !== roles.length - 1) {
                roleN = bot.servers[serverID].roles[roles[i]].name
                roleN = roleN.replace(' ', '')
                rolesm = rolesm + roleN + ', '
            } else {
                roleN bot.servers[serverID].roles[roles[i]].name
                roleN = roleN.replace(' ', '')
                rolesm = rolesm + roleN
            }
        }
    } else {
        rolesm = 'everyone'
    }

    avatarL = '"https://discordapp.com/api/users/' + userID + '/avatars/' + avatar + '.jpg"'
    message = '' +
        'Name:      ' + userN + '#' + discriminator + '\n' +
        'Nickname:  ' + nick + '\n' +
        'ID:        ' + userID + '\n\n' +
        'Status:    ' + status + '\n' +
        'Bot:       ' + botT + '\n' +
        'Roles:     ' + rolesm + '\n' +
        'Muted:     ' + mute + '\n' +
        'Deafened:  ' + deaf + '\n\n' +
        'Joined:    ' + join + '\n' +
        'Avatar:    ' + avatarL
    if (cl) {
        return message
    } else {
        messageSend(channelID, message, true, 'xl')
    }
}
/*/Url shortener/*/
function shorten(cl, ulink, channelID, userID, messageID, debug) {
    request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + ulink + '&access_token=' + config.bitLy, function(error, response, body) {
        messageDelete(channelID, messageID)
        body = JSON.parse(body)
        if (debug) {
            messageSend(channelID, body, true, 'json')
        }
        console.log(cl)
        console.log(error)
        console.log(response.statusCode)
        if (cl === false) {
            if (!error && response.statusCode === 200) {
                if (body.status_txt === 'OK') {
                    messageSend(channelID, '<@' + userID + '> Here is a short url: ' + body.data.url)
                } else {
                    console.log(body)
                    messageSend(channelID, '<@' + userID + '> There was a error processing that url')
                }
            }
        } else {
            if (body.status_txt === 'OK') {
                console.log(body)
                prevUrl = body.data.url
                return body.data.url
            } else {
                return body.status_txt
            }
        }
    })
}
/*/Title Case/*/
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
/*/Sentance Case/*/
function toSentenceCase(string) {
    var n = string.split(".");
    var vfinal = ""
    for (i = 0; i < n.length; i++) {
        var spaceput = ""
        var spaceCount = n[i].replace(/^(\s*).*$/, "$1").length;
        n[i] = n[i].replace(/^\s+/, "");
        var newstring = n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
        for (j = 0; j < spaceCount; j++)
            spaceput = spaceput + " ";
        vfinal = vfinal + spaceput + newstring + ".";
    }
    vfinal = vfinal.substring(0, vfinal.length - 1);
    return vfinal
}
/*/Word!/*/
function wordNik(cl, channelID, userID, word, type, debug) {
    if (type === 'def') {
        request('http://api.wordnik.com:80/v4/word.json/' + word + '/definitions?limit=1&includeRelated=false&sourceDictionaries=webster%2Ccentury%2Cwiktionary%2Cahd%2Cwordnet&useCanonical=false&includeTags=false&api_key=' + config.wordNik, function(error, response, body) {
            body = JSON.parse(body)
            console.log(body)
            if (debug) {
                messageSend(channelID, body, true, 'json', true, userID)
            }
            try {
                for (var semi = 0; semi > -1;) {
                    body[0].text = body[0].text.replace(';', '.')
                    semi = body[0].text.indexOf(';')
                }
            } catch (e) {
                /*/*/
            }
            if (cl === false) {
                try {
                    if (!error && response.statusCode === 200) {
                        messageSend(channelID, 'Word: ' + toSentenceCase(body[0].word) + ';\n\n' +
                            'PartofSpeech: ' + body[0].partOfSpeech + ';\n' +
                            'Definition: ' + body[0].text + ';', true, 'css', true, userID)
                    }
                } catch (e) {
                    messageSend(channelID, "Bad word!", false, null, true, userID)
                }
            } else {
                return body
            }
        })
    } else if (type === 'wotd') {
        request('http://api.wordnik.com:80/v4/words.json/wordOfTheDay?api_key=' + config.wordNik, function(error, response, body) {
            body = JSON.parse(body)
            for (var semi = 0; semi > -1;) {
                body.examples[0].text = body.examples[0].text.replace(';', '.')
                semi = body.examples[0].text.indexOf(';')
            }
            if (debug) {
                messageSend(channelID, body, true, 'json')
            }
            if (cl === false) {
                if (!error && response.statusCode === 200) {

                    messageSend(channelID, 'Word: ' + toSentenceCase(body.word) + ';\n\n' +
                        'PartOfSpeech: ' + body.definitions[0].partOfSpeech + ';\n' +
                        'Definition: ' + body.definitions[0].text + ';\n\n' +
                        'ExampleUseage: ' + body.examples[0].text + ';\n' +
                        'CitedFrom: ' + body.examples[0].title + ';\n\n' +
                        'Url: ' + body.examples[0].url + ';', true, 'css', true, userID)
                }
            } else {
                return body
            }
        })
    }
}
/*/File Upload/*/
function fileU(channelID, userID, file) {
    try {
        bot.uploadFile({
            to: channelID,
            file: file,
            filename: file,
            message: "<@" + userID + "> Heres that file"
        });
        return "Sucess"
    } catch (e) {
        return "There was a error with that"
    }
}
var startUpTime = null
    /* Bot on event functions */
bot.on('ready', function() {
    logger.info(chalk.blue("Rebuilding tracked servers, users, and channels. This could take a while...\n"))
    startUpTime = gettime()
    serverlist(false, true)
    channellist(false, true)
    userlist(false, true)
    logger.info(chalk.magenta(bot.username + " -- (" + bot.id + ")" + " Is now running"))
    statusmsg("help | info | invite")
});
bot.on('debug', function(rawEvent) {
    try {
        var announceID = storage.d.Servers[bot.servers[rawEvent.d.guild_id].name].settings.announceChan
    } catch (e) {
        announceID = null
    }
    if (rawEvent.t === "MESSAGE_UPDATE") {
        //console.log(chalk.gray(rawEvent.d.username + " Edited a message, it now reads: " + rawEvent.d.content))
    }
    if (rawEvent.t === "GUILD_MEMBER_ADD") {
        var name = rawEvent.d.user.username
        var userID = rawEvent.d.user.id
        storage.d.Users[name] = {
            "id": userID,
            "messageCnt": 0,
            "linkCnt": 0,
            "status": "unknown",
            "lastseen": "unknown"
        }
        if (announceID !== null) {
            messageSend(announceID, "<@" + rawEvent.d.user.id + "> Just joined the server! welcome " + rawEvent.d.user.username + " to " + bot.servers[rawEvent.d.guild_id].name + "!")
        }
    }
    if (rawEvent.t === "GUILD_MEMBER_REMOVE") {
        var name = rawEvent.d.user.username
        var userID = rawEvent.d.user.id
        if (announceID !== null) {
            messageSend(announceID, "<@" + rawEvent.d.user.id + "> Just left the server! :cold_sweat:")
        }
    }
    if (rawEvent.t === "GUILD_CREATE") {
        var name = rawEvent.d.name
        var serverID = rawEvent.d.id
        var SownerId = rawEvent.d.owner_id
        if (storage.d.Servers[name] === undefined) {
            storage.d.Servers[name] = {
                'id': serverID,
                'messageCnt': 0,
                'settings': {
                    'announceChan': null,
                    'verb': false
                },
                'SownerId': SownerId,
                'Channels': {}
            }
        }
    }
    if (rawEvent.t === "CHANNEL_CREATE") {
        /*console.log(rawEvent)
        var name = rawEvent.d.name
        var channelID = rawEvent.d.id
        var type = rawEvent.d.type
        var sname = rawEvent.d.guild_id
        storage.d.Servers[sname].Channels[name] = {
            "id": channelID,
            "type": type,
            "messageCnt": 0,
        }*/
        channellist()
    }
    if (rawEvent.t === "CHANNEL_UPDATE") {
        sname = bot.servers[rawEvent.d.guild_id].name
        cID = rawEvent.d.id
        newName = rawEvent.d.name
        topic = rawEvent.d.topic
        logger.info(chalk.gray("Channel just updated, Channel Name: " + newName + " Topic: " + topic))
        for (var cname in storage.d.Servers[sname].Channels) {
            if (storage.d.Servers[sname].Channels[cname].id === cID) {
                storage.d.Servers[sname].Channels[newName] = storage.d.Servers[sname].Channels[cname]
                storage.d.Servers[sname].Channels[newName].topic = topic
                delete storage.d.Servers[sname].Channels[cname]
            }
        }
    }
});
bot.on('disconnected', function() {
    logger.error(chalk.red("Bot got disconnected, reconnecting"))
    bot.connect()
    logger.info(chalk.green("Reconnected"))
});
bot.on("presence", function(user, userID, status, gameName, rawEvent) {
    var sname = bot.servers[rawEvent.d.guild_id].name
    try {
        var verb = storage.d.Servers[sname].settings.verb
    } catch (e) {
        verb = false
        storage.d.Servers[sname].settings.verb = false
    }
    try {
        if (storage.d.Users[user] === "undefined") {
            storage.d.Users[user] = {
                "id": userID,
                "messageCnt": 0,
                "linkCnt": 0,
                "status": "unknown",
                "lastseen": "unknown",
                "rawLastSeen": 0
            }
        }
        if (status === 'offline') {
            if (user !== undefined) {
                var lastseen = moment().format('MMMM Do YYYY, hh:mm:ss a')
                storage.d.Users[user].lastseen = lastseen
                storage.d.Users[user].rawLastSeen = gettime()
                if (storage.d.Users[user].status !== 'offline' && verb) {
                    logger.info(chalk.gray(lastseen + ' : ' + chalk.red(user + " is now: " + chalk.underline(status))));
                }
                storage.d.Users[user].status = status
            } else if (user === undefined) {
                var lastseen = moment().format('MMMM Do YYYY, hh:mm:ss a')
                storage.d.Users[user].rawLastSeen = gettime()
                for (var user in storage.d.Users) {
                    if (userID === storage.d.Users[user].id) {
                        storage.d.Users[user].lastseen = lastseen
                        storage.d.Users[user].rawLastSeen = gettime()
                        if (storage.d.Users[user].status !== 'offline' && verb) {
                            logger.info(chalk.gray(lastseen + ' : ' + chalk.red(user + " is now: " + chalk.underline(status))));
                        }
                        storage.d.Users[user].status = status
                    } else {
                        continue
                    }
                }
            }
        }
        if (status === 'idle') {
            var lastseen = moment().format('MMMM Do YYYY, hh:mm:ss a')
            storage.d.Users[user].lastseen = lastseen
            storage.d.Users[user].rawLastSeen = gettime()
            if (storage.d.Users[user].status !== 'idle' && verb) {
                logger.info(chalk.gray(lastseen + ' : ' + chalk.yellow(user + " is now: " + chalk.underline(status))));
            }
            storage.d.Users[user].status = status
        }
        if (status === 'online') {
            var lastseen = moment().format('MMMM Do YYYY, hh:mm:ss a')
            usrStatus = storage.d.Users[user].status
            if (usrStatus === 'idle') {
                var usrStatIdle = storage.d.Users[user].totalIdle
                    //console.log('prev idle')
                if (storage.d.Users[user].totalIdle === undefined) {
                    storage.d.Users[user].totalIdle = {
                        'd': 0,
                        'h': 0,
                        'm': 0,
                        's': 0
                    }
                } else {
                    var lastIdleTime = storage.d.Users[user].totalIdle
                    var previousIdle = secondsToTime(gettime() - storage.d.Users[user].rawLastSeen)
                    lastIdleTime.d = lastIdleTime.d + previousIdle.d
                    lastIdleTime.h = lastIdleTime.h + previousIdle.h
                    lastIdleTime.m = lastIdleTime.m + previousIdle.m
                    lastIdleTime.s = lastIdleTime.s + previousIdle.s
                    lastIdleTime.m = lastIdleTime.m * 60
                    lastIdleTime.h = lastIdleTime.h * 3600
                    lastIdleTimeC = lastIdleTime.m + lastIdleTime.s + lastIdleTime.h
                    lastIdleTimeC = secondsToTime(lastIdleTimeC)
                    lastIdleTime.d = lastIdleTime.d + lastIdleTimeC.d
                    lastIdleTime.h = lastIdleTimeC.h
                    lastIdleTime.m = lastIdleTimeC.m
                    lastIdleTime.s = lastIdleTimeC.s
                    storage.d.Users[user].totalIdle = lastIdleTime
                    lastIdleTime = {}
                    previousIdle = {}
                }
            } else if (usrStatus === 'offline') {
                //console.log('prev Offline')
                var usrStatOff = storage.d.Users[user].totalOffline
                if (storage.d.Users[user].totalOffline === undefined) {
                    storage.d.Users[user].totalOffline = {
                        'd': 0,
                        'h': 0,
                        'm': 0,
                        's': 0
                    }
                } else {
                    var lastOfflineTime = storage.d.Users[user].totalOffline
                    var previousOffline = secondsToTime(gettime() - storage.d.Users[user].rawLastSeen)
                    lastOfflineTime.d = lastOfflineTime.d + previousOffline.d
                    lastOfflineTime.h = lastOfflineTime.h + previousOffline.h
                    lastOfflineTime.m = lastOfflineTime.m + previousOffline.m
                    lastOfflineTime.s = lastOfflineTime.s + previousOffline.s
                    lastOfflineTime.m = lastOfflineTime.m * 60
                    lastOfflineTime.h = lastOfflineTime.h * 3600
                    lastOfflineTimeC = lastOfflineTime.m + lastOfflineTime.s + lastOfflineTime.h
                    lastOfflineTimeC = secondsToTime(lastOfflineTimeC)
                    lastOfflineTime.d = lastOfflineTime.d + lastOfflineTimeC.d
                    lastOfflineTime.h = lastOfflineTimeC.h
                    lastOfflineTime.m = lastOfflineTimeC.m
                    lastOfflineTime.s = lastOfflineTimeC.s
                    storage.d.Users[user].totalOffline = lastOfflineTime
                    lastOfflineTime = {}
                    previousOffline = {}
                }
            }
            if (storage.d.Users[user].status !== 'online' && verb) {
                logger.info(chalk.gray(lastseen + ' : ' + chalk.green(user + " is now: " + chalk.underline(status))));
            }
            storage.d.Users[user].status = status
        }
    } catch (e) {
        return
    }

    writeJSON('./assets/storage', storage)
});
bot.on('message', function(user, userID, channelID, message, rawEvent) {
    if (storage.settings.ignoredChannels.indexOf(channelID) !== -1) {
        var ignore = true
    }
    rconcmd = 'No'
    if (channelID in bot.directMessages) {
        DM = true
    } else {
        DM = false
    }
    //Gets the message id and server id
    var messageID = rawEvent.d.id
    var serverID = bot.serverFromChannel(channelID)
        //gets the server and channel name
    try {
        var cname = bot.servers[serverID].channels[channelID].name
        var sname = bot.servers[serverID].name
    } catch (e) {
        //ig
    }
    try {
        if (storage.d.Servers[sname].SownerId !== undefined) {
            var SownerId = storage.d.Servers[sname].SownerId
        }
    } catch (e) {
        error = true
    }
    try {
        verb = storage.d.Servers[sname].settings.verb
    } catch (e) {
        verb = false
        storage.d.Servers[sname].settings.verb = false
    }
    /*try {
        if (storage.d.Servers[sname] === undefined) {
            storage.d.Servers[name] = {
                'id': serverID,
                'messageCnt': 0,
                'settings': {
                    'announceChan': null,
                    'verb': false,
                },
                'SownerId': SownerId,
                'Channels': {}
            }
        }
    } catch (e) {
        console.log(e)
    }*/
    //Logging Related
    if (storage.d.Users[user] !== undefined) {
        if (storage.d.Users[user].messageCnt === undefined) {
            storage.d.Users[user].messageCnt = 1
        } else {
            mucount = storage.d.Users[user].messageCnt
            mucount = mucount + 1
            storage.d.Users[user].messageCnt = mucount
        }
        writeJSON('./assets/storage', storage)
    }
    if (message.toLowerCase().indexOf('http') !== -1) {
        var timeAt = moment().format('MMMM Do YYYY, hh:mm:ss a')
        logger.info(chalk.gray("Link Posted, logging to file"))
        if (message.indexOf(' ', message.indexOf('http')) === -1) {
            var link = '[' + timeAt + '] ' + user + ': ' + message.substring(message.indexOf('http'))
        } else if (message.indexOf(' ', message.indexOf('http')) !== -1) {
            var link = '[' + timeAt + '] ' + user + ': ' + message.substring(message.indexOf('http'), message.indexOf(' ', message.indexOf('http')))
        }
        if (storage.d.Users[user] !== undefined) {
            if (storage.d.Users[user].linkCnt === undefined) {
                storage.d.Users[user].linkCnt = 1
            } else {
                lucount = storage.d.Users[user].linkCnt
                lucount = lucount + 1
                storage.d.Users[user].linkCnt = lucount
            }
            writeJSON('./assets/storage', storage)
        }
        mkdirp('./logs/' + sname, function(err) {
            fs.appendFile("logs/" + sname + "/Links.txt", '\n' + link)
        })
    }
    if (cname !== undefined) {
        try {
            if (storage.d.Servers[sname].Channels[cname].messageCnt === undefined) {
                storage.d.Servers[sname].Channels[cname].messageCnt = 1
            } else {
                mccount = storage.d.Servers[sname].Channels[cname].messageCnt
                mccount = mccount + 1
                storage.d.Servers[sname].Channels[cname].messageCnt = mccount
            }
        } catch (e) {
            try {
                if (storage.d.Servers[sname].Channels[cname] === undefined) {
                    storage.d.Servers[sname].Channels[cname] = {
                        "id": channelID,
                        "type": 'text',
                        "messageCnt": 0,
                    }
                }
            } catch (e) {
                e = e
            }
        }
        writeJSON('./assets/storage', storage)
    }
    if (sname !== undefined) {
        if (storage.d.Servers[sname].messageCnt === undefined) {
            storage.d.Servers[sname].messageCnt = 1
        } else {
            mscount = storage.d.Servers[sname].messageCnt
            mscount = mscount + 1
            storage.d.Servers[sname].messageCnt = mscount
        }
        writeJSON('./assets/storage', storage)
    }
    //debug!
    if (debug === 1) {
        console.log(rawEvent)
    }
    try {
        if (storage.d.Servers[sname].settings.prefixOvrid !== undefined) {
            commandmod = storage.d.Servers[sname].settings.prefixOvrid
        } else {
            commandmod = '!'
        }
    } catch (e) {
        e = e
    }
    //function to quick call message sending to minimize code
    function msgT(msg, cb, type) {
        if (cb === true) {
            if (type === 'json') {
                msg = JSON.stringify(msg, null, '\t')
            }
            if (type !== undefined) {
                msg = '\n\n```' + type + '\n' + msg + '```'
            } else {
                msg = '\n\n```' + msg + '```'
            }
        }
        bot.sendMessage({
            to: channelID,
            message: msg,
            typing: false
        });
    }
    //try {
    try {
        if (rawEvent.d.mentions[0].id !== undefined) {
            if (rawEvent.d.mentions[0].id === bot.id) {
                if (message.indexOf('<@') === 0) {
                    message = message.replace("<@" + bot.id + "> ", commandmod)
                }
            }
        }
    } catch (e) {
        var error = null
    }
    //This tests for commands using the command mod set in the config
    if (message.indexOf(commandmod) === 0) {
        message = message.replace(commandmod, '')
        if (message.toLowerCase().indexOf('ping') === 0 && ignore !== true) {
            messageSend(channelID, 'pong')
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('help') === 0 && ignore !== true) {

            if (message.indexOf(' ') === -1) {
                help('help', channelID)
            } else {
                helpcall = message.substring(message.indexOf(' ') + 1)
                help(helpcall, channelID)
            }
        }
        if (message.toLowerCase().indexOf('info') === 0 && ignore !== true) {
            messageSend(channelID, "\n```Currently connected to: " + serverCnt + " Servers\n" +
                "With a total of: " + channelCnt + " Channels\n" +
                "With approximatly: " + userCnt + " Users across all of them```\n" +
                doc.info)
        }
        if (message.toLowerCase().indexOf('roll') === 0 && ignore !== true) {
            var msg = message
            var dice = msg.replace('roll ', '')
            diceroll(dice, userID, channelID)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf("avatar") === 0 && ignore !== true) {
            bot.uploadFile({
                to: channelID,
                file: "./assets/avatar.png",
                filename: "avatar.png",
                message: "Here you go!",
                typing: true
            });
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('ids') === 0 && ignore !== true) {
            bot.sendMessage({
                to: channelID,
                message: '<@' + userID + '>' + ' Your userID is: ' + userID + ' and your channelID is: ' + channelID,
                typing: false
            });
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('math') === 0 && ignore !== true) {
            var mathcmd = message
            var mathcall = mathcmd.replace('math ', '')
            try {
                messageSend(channelID, '<@' + userID + '>' + " the answer is this: " + math.eval(mathcall))
            } catch (e) {
                logger.error("Bad Math Command " + mathcall + " | " + e)
                messageSend(channelID, "Sorry I'm unable to run that")
            }
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('status') === 0 && ignore !== true) {
            var statuscmd = message
            var statuscall = statuscmd.replace('status ', '')
            status(statuscall, channelID, rawEvent)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('commands') === 0 && ignore !== true) {
            cList = "help, "
            messageSend(channelID, "Check your PM's :mailbox_with_mail:")
            for (var i = 0; i < doc.cList.length; i++) {
                if (i < doc.cList.length - 1) {
                    cList = cList + doc.cList[i] + ", "
                } else {
                    cList = cList + doc.cList[i]
                }
            }
            messageSend(userID, "Here are my commands!: \n\n```" + cList + '```\n')
            messageDelete(channelID, messageID)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('poke') === 0 && ignore !== true) {
            var pkcmd = message
            var pkcall = pkcmd.replace('poke ', '')
            var pkcall = pkcall.replace('<@', '')
            var pkcall = pkcall.replace('>', '')
            messageSend(pkcall, "Hi <@" + pkcall + "> You where poked by: <@" + userID + "> in: <#" + channelID + ">")
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('stats') === 0 && ignore !== true) {
            var len = message.length
            var name = message.substring(message.indexOf(' ') + 1)
            if (len === 5) {
                try {
                    statW = whoIs(channelID, serverID, user, true)
                    wLink = statW.substring(statW.indexOf('"h') + 1, statW.indexOf('g"') + 1)
                    whoRest = statW.substring(0, statW.indexOf('Avatar'))
                    request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + wLink + '&access_token=' + config.bitLy, function(error, response, body) {
                        body = JSON.parse(body)
                        thing = whoRest + 'Avatar:    "' + body.data.url + '"'
                        messageSend(channelID, thing + '\n\n' +
                            "Messages Sent:       " + storage.d.Users[user].messageCnt + '\n' +
                            "Links Sent:          " + storage.d.Users[user].linkCnt + '\n' +
                            "Total Time Idle:     " + storage.d.Users[user].totalIdle.d + " Days " + storage.d.Users[user].totalIdle.h + " Hours " + storage.d.Users[user].totalIdle.m + " Minutes " + storage.d.Users[user].totalIdle.s + " Seconds\n" +
                            "Total Time Offline:  " +
                            storage.d.Users[user].totalOffline.d + " Days " + storage.d.Users[user].totalOffline.h + " Hours " + storage.d.Users[user].totalOffline.m + " Minutes " + storage.d.Users[user].totalOffline.s + " Seconds", true, 'xl', true, userID)
                    })
                } catch (e) {
                    messageSend(channelID, 'Um...There was a error doing that, probally because you havent sent any links yet')
                }
            } else if (message.toLowerCase().indexOf('server') !== -1) {
                messageSend(channelID, "The total ammount of messages sent on this server is: " + storage.d.Servers[sname].messageCnt)
            } else if (message.toLowerCase().indexOf('channel') !== -1) {
                messageSend(channelID, "The total ammount of messages sent on this channel is: " + storage.d.Servers[sname].Channels[cname].messageCnt)
            } else {
                stats(channelID, name, rawEvent, channelID, serverID)
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('ignore') === 0) {
            var igcmd = message
            var igcall = igcmd.replace('ignore ', '')
            if (userID.indexOf(ownerId) === 0) {
                if (igcall.toLowerCase().indexOf('remove') !== -1 && userID.indexOf(ownerId) === 0) {
                    uningoreC(channelID)
                    messageSend(channelID, 'Ok no longer ignoring this channel')
                } else {
                    ignoreC(channelID)
                    messageSend(channelID, 'Ok ignoring this channel')
                }
            } else if (userID.indexOf(SownerId) === 0 && userID.indexOf(ownerId) === 0) {
                if (igcall.toLowerCase().indexOf('remove') !== -1 && userID.indexOf(SownerId) === -1) {
                    uningoreC(channelID)
                    messageSend(channelID, 'Ok no longer ignoring this channel')
                } else {
                    ignoreC(channelID)
                    messageSend(channelID, 'Ok ignoring this channel')
                }
            } else {
                messageSend(channelID, "You are not allowed to do that command, you need to be either the bot or server owner")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('prune') === 0 && ignore !== true) {
            pcall = message.substring(message.indexOf(' ') + 1)
            if (userID.indexOf(ownerId) === 0) {
                messagesDelete(channelID, pcall)
                messageSend('Ok removing the last ' + pcall + " Messages")
            } else if (userID.indexOf(SownerId) === 0 && userID.indexOf(ownerId) === -1) {
                messagesDelete(channelID, pcall)
                messageSend('Ok removing the last ' + pcall + " Messages")
            } else {
                messageSend(channelID, "You are not allowed to do that command, you need to be either the bot or server owner/Admin")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('prefix') === 0 && ignore !== true) {
            var pfcmd = message
            var pfcall = pfcmd.replace('prefix ', '')
            if (userID.indexOf(ownerId) === 0) {
                storage.d.Servers[sname].settings.prefixOvrid = pfcall
                messageSend(channelID, "The prefix for this server is now: " + pfcall)
            } else if (userID.indexOf(SownerId) === 0 && userID.indexOf(ownerId) === -1) {
                storage.d.Servers[sname].settings.prefixOvrid = pfcall
                messageSend(channelID, "The prefix for this server is now: " + pfcall)
            } else if (userID.indexOf(ownerId) === -1 && userID.indexOf(SownerId) === -1 && userID.indexOf(bot.id) === -1) {
                messageSend(channelID, "You are not allowed to do that command, you need to be either the bot or server owner")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('yt') === 0 && ignore !== true) {
            var ytcmd = message
            var ytcall = ytcmd.replace('yt ', '')
            yt(ytcall, userID, channelID)
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('shorten') === 0 && ignore !== true) {
            var lurl = message.substring(message.indexOf(' ') + 1)
            shorten(false, lurl, channelID, userID, messageID)
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('clever') === 0 && ignore !== true) {
            cleverr = message.substring(message.indexOf(' ') + 1)
            clever(channelID, userID, cleverr)
        }
        if (message.toLowerCase().indexOf('8ball') === 0 && ignore !== true) {
            ebQ = message.substring(message.indexOf(' ') + 1)
            eightBall(channelID, ebQ, userID)
        }
        if (message.toLowerCase().indexOf('xkcd') === 0 && ignore !== true) {
            if (message.indexOf(' ') === -1) {
                var comictime = gettime()
                try {
                    lastcomictime = storage.d.Servers[sname].Channels[cname].lastComic
                    elapsed = comictime - lastcomictime
                    elapsed = secondsToTime(elapsed)
                    comicacttime = storage.d.Servers[sname].Channels[cname].lastComicActt
                    console.log("Comic elapsed: " + JSON.stringify(elapsed))
                } catch (e) {
                    storage.d.Servers[sname].Channels[cname].lastComic = null
                    storage.d.Servers[sname].Channels[cname].lastComicActt = null
                }
                if (elapsed.h > 0) {
                    var comicacttime = moment().format('h:mm a')
                    storage.d.Servers[sname].Channels[cname].lastComicActt = comicacttime
                    xkcd.img(function(err, res) {
                        if (!err) {
                            messageSend(channelID, res.title + "\n" + res.url)
                        }
                    });
                    var lastcomictime = gettime()
                    storage.d.Servers[sname].Channels[cname].lastComic = lastcomictime
                } else {
                    messageSend(channelID, ":no_entry: Hey hold up, only one comic per hour, last comic was posted: " + comicacttime)
                }
            } else {
                var xkcdcmd = message
                var xkcdcall = xkcdcmd.replace('xkcd ', '')
                relxkcd(xkcdcall, channelID, cname, sname)
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('pirate') === 0 && ignore !== true) {
            if (userID.indexOf(ownerId) === 0) {
                if (storage.d.Servers[sname].settings.pirate === false || storage.d.Servers[sname].settings.pirate === undefined) {
                    storage.d.Servers[sname].settings.pirate = true
                    messageSend(channelID, "Ok i should now be speaking like i am a pirate")
                } else {
                    storage.d.Servers[sname].settings.pirate = false
                    messageSend(channelID, "Ok i'm no longer a pirate")
                }
            } else if (userID.indexOf(SownerId) === 0 && userID.indexOf(ownerId) === -1) {
                if (storage.d.Servers[sname].settings.pirate === false || storage.d.Servers[sname].settings.pirate === undefined) {
                    storage.d.Servers[sname].settings.pirate = true
                    messageSend(channelID, "Ok i should now be speaking like i am a pirate")
                } else {
                    storage.d.Servers[sname].settings.pirate = false
                    messageSend(channelID, "Ok i'm no longer a pirate")
                }
            } else {
                messageSend(channelID, "Only the bot or server owner can do this")
            }
        }
        if (message.toLowerCase().indexOf('skip') === 0 && ignore !== true) {
            bot.deleteMessage({
                channel: channelID,
                messageID: messageID
            })
        }
        if (message.toLowerCase().indexOf('announce') === 0 && ignore !== true) {
            if (userID.indexOf(SownerId) === 0) {
                if (storage.d.Servers[sname].settings.announceChan === null || storage.d.Servers[sname].settings.announceChan === undefined) {
                    try {
                        storage.d.Servers[sname].settings.announceChan = channelID
                        messageSend(channelID, "Ok now announcing user changes on this channel")
                    } catch (e) {
                        logger.error(chalk.red(e))
                    }
                } else {
                    try {
                        storage.d.Servers[sname].settings.announceChan = null
                        messageSend(channelID, "Ok no longer announcing user changes on this channel")
                    } catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
            } else {
                messageSend(channelID, "You are not allowed to do that command, you need to be the server owner")
            }
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('cat') === 0 && ignore !== true) {
            cat(channelID, cname, sname)
        }
        if (message.toLowerCase().indexOf('snake') === 0 && ignore !== true) {
            snake(channelID, cname, sname, userID)
        }
        if (message.toLowerCase().indexOf('pug') === 0 && ignore !== true) {
            pug(channelID, cname, sname)
        }
        if (message.toLowerCase().indexOf('redditscenery') === 0 && ignore !== true) {
            var random = redditList[Math.floor(Math.random() * redditList.length)]
            var redditcmd = message
            var redditcall = redditcmd.replace('redditscenery ', '')
            if (redditcall.toLowerCase().indexOf('add') !== -1 && userID.indexOf(ownerId) === 0) {
                var redditcall = redditcmd.replace('add  ', '')
                storage.settings.redditList.push(redditcall)
            } else if (redditcall.toLowerCase().indexOf('list') !== -1) {
                redditNList = ""
                for (var i = 0; i < redditList.length; i++) {
                    if (i < redditList.length - 1) {
                        redditNList = redditNList + redditList[i] + ", "
                    } else {
                        redditNList = redditNList + redditList[i]
                    }
                }
                messageSend(channelID, "Check your PM's :mailbox_with_mail:")
                messageSend(userID, "Here are my tracked subreddits!: \n\n```" + redditNList + '```\n')
            } else if (redditcmd.indexOf(' ') !== -1) {
                redditScenery(channelID, redditcall.toLowerCase())
            } else {
                messageSend(channelID, "Ok heres a " + random + " related picture")
                console.log('Random')
                redditScenery(channelID, random)
            }
        }
        if (message.toLowerCase().indexOf('verb') === 0) {
            if (userID.indexOf(ownerId) === 0) {
                if (storage.d.Servers[sname].settings.verb === false || storage.d.Servers[sname].settings.verb === undefined) {
                    try {
                        storage.d.Servers[sname].settings.verb = true
                        messageSend(channelID, "Ok now logging messages and status changes from this server into console")
                    } catch (e) {
                        logger.error(chalk.red(e))
                    }
                } else {
                    try {
                        storage.d.Servers[sname].settings.verb = false
                        messageSend(channelID, "Ok no longer logging messages and status changes from this server into console")
                    } catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
            } else {
                messageSend(channelID, '<@' + userID + "> You are not allowed to use this command")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('word') === 0) {
            if (message.toLowerCase().indexOf('wotd') !== -1) {
                wordNik(false, channelID, userID, null, 'wotd', false)
            } else {
                var word = message.substring(message.indexOf(' ') + 1)
                wordNik(false, channelID, userID, word, 'def', false)
            }
        }
        if (message.toLowerCase().indexOf('uptime') === 0 && ignore !== true) {
            time = secondsToTime(gettime() - startUpTime)
            messageSend(channelID, "The bot has been active for: " + time.d + " Days " + time.h + " Hours " + time.m + " Minutes " + time.s + " Seconds")
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('us') === 0 && ignore !== true) {
            var uri = message.substring(message.indexOf(' ') + 1)
            unShorten(channelID, userID, uri)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('invite') === 0 && ignore !== true) {
            messageSend(channelID, "Here is my invite link: https://goo.gl/IppQQT \nIf you dont trust short urls use the following command to unshorten it: " + commandmod + "us https://goo.gl/IppQQT \n\nBy default the bot is set to hav all permissions, just pick what you want it to have, at a minimum it needs read and manage messages")
        }
        if (message.toLowerCase().indexOf('js') === 0) {
            jscall = message.substring(message.indexOf(' ') + 1)
            if (userID.indexOf(ownerId) === 0) {
                try {
                    eval(jscall)
                } catch (e) {
                    logger.error(chalk.red("Bad JS Command " + e))
                    messageSend(channelID, "Err...I'm sorry...that results in a error")
                }
            } else {
                messageSend(channelID, '<@' + userID + "> You are not allowed to use this command, only <@" + ownerId + "> can because it can damage the bot")
            }
            rconcmd = 'Yes'
        } else {
            if (rconcmd === 'No') {
                //clever(channelID,userID,message)
            }
        }
    }
    if (channelID === '164845697508704257') {
        if (message.indexOf('#') !== -1) {
            for (var pound = 0; pound > -1;) {
                message = message.replace('#', '')
                pound = message.indexOf('#')
            }
            message = '######' + toSentenceCase(message) + '######'
        }
        if (message.indexOf(': ') !== -1) {
            nme = message.substring(0, message.indexOf(': '))
            nme = toSentenceCase(nme)
            said = message.substring(message.indexOf(': ') + 2)
            said = toSentenceCase(said)
            message = nme + ': ' + said
        }
        console.log(chalk.gray(message))
        fs.appendFile("logs/space.txt", '\n\n' + message)
        story.space(message, {
            mID: messageID,
            username: user
        })
    }
    if (channelID === '167855344129802241') {
        console.log(chalk.gray(message))
        fs.appendFile("logs/unknown.txt", '\n\n' + message)
        story.unknown(message, {
            mID: messageID,
            username: user
        })
    }
    if (channelID === '177624925794861056') {
        console.log(chalk.gray(message))
        fs.appendFile("logs/laderis.txt", '\n\n' + message)
        story.laderis(message, {
            mID: messageID,
            username: user
        })
    }
    //Special conditions to prevent the logging of bots and specially monitored chats
    if (userID.indexOf('104867073343127552') === 0 || channelID.indexOf('164845697508704257') === 0 || channelID.indexOf('167855344129802241') === 0) {
        if (userID === '104867073343127552') {
            return
        } else if (channelID.indexOf('164845697508704257') === 0) {
            return
        } else if (channelID.indexOf('167855344129802241')) {
            return
        }
    } else if (rconcmd === "No" && ignore !== true) {
        var timed = Date()
        timed = '[' + timed.replace(' GMT-0500 (CDT)', '') + '] '
        timed = timed.replace('GMT-0500 (Central Daylight Time)', '')
        if (channelID in bot.directMessages) {
            console.log(timed + 'Channel: ' + 'DM |\n' + chalk.yellow(user + ': ') + message)
            fs.appendFile("logs/DMs/" + user + ".txt", '\n' + timed + user + ": " + message)
        } else {
            servern = bot.servers[serverID].name
            channeln = bot.servers[serverID].channels[channelID].name
            mkdirp('./logs/' + servern, function(err) {
                fs.appendFile("./logs/" + servern + '/' + channeln + '.txt', '\n' + timed + user + ": " + message)
            })
            try {
                if (verb === true || cnaid === channelID || storage.d.Servers[sname].settings.verb === true) {
                    console.log('\n' + timed + 'Channel: ' + chalk.blue(servern + '/' + channeln) + ' |\n' + chalk.cyan(user + ': ') + message)
                }
            } catch (e) {
                //do nothing
            }
        }
    } else if (rconcmd === "Yes" && ignore !== true) {
        if (ignore !== true) {
            logger.info(chalk.gray('Last Message User: ' + user + ' |IDs: ' + ' ' + userID + '/' + channelID + ' |\n Message: ' + message));
        }
    }
});


/* Start of console input */
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});
rl.on('line', function(line) {
    consoleparse(line);
})