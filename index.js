/* Welcome, this is scratch bots source code, everything that makes her run and tick! */
var Discord = require('discord.io'),
    winston = require('winston'),
    config = require('../../config.json'),
    fs = require('fs'),
    Roll = require('roll'),
    math = require('mathjs'),
    readline = require('readline'),
    YouTube = require('youtube-node'),
    youTube = new YouTube(),
    moment = require('moment'),
    xkcd = require('xkcd-imgs'),
    chalk = require('chalk'),
    request = require('request'),
    mkdirp = require('mkdirp'),
    doc = require('./assets/doc.json'),
    Cleverbot = require('cleverbot-node'),
    pirateSpeak = require('pirate-speak'),
    google = require('googleapis'),
    urlshortener = google.urlshortener('v1'),
    schedule = require('node-schedule'),
    bot = new Discord.Client({
        autorun: true,
        //email: config.email,
        //password: config.pass,
        token: config.token
    }),
    cmds = require('./assets/modules'),
    perm = require('./assets/modules/permissionHelper.js')(bot),
    startupF = false,
    db = require('./db.js'),
    shortid = require('shortid'),
    meta

cleverbot = new Cleverbot
roll = new Roll();
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
                //            handleExceptions: true,
                //            humanReadableUnhandledException: true
            })
        ]
    }),
    story = new(winston.Logger)({
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

setTimeout(function() {
    startupF = true
}, 5000)

/*/Load Up a Youtube Api Key /*/
youTube.setKey(config.youTubeApiKey);
/*/Bot credentials/*/


/* Global variable setting */
var cnaid = '171798432749584387',
    dateFormat = 'MMMM Do YYYY, h:mm:ss a',
    lastseen = null,
    logChan = config.logChan,
    sentPrevId = null,
    commandmod = config.cmdMod,
    ownerId = config.ownerId,
    rconcmd = 'No',
    clist = doc.cList,
    debug = false,
    serverID = null,
    xkcdJson = null,
    verb = false,
    prevUrl,
    num = 0

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

                    messageSend(channelID, '\nTitle:       ' + result.items[0].snippet.title + ';\n\nDescription: ' + description + ';', {
                        cb: true,
                        type: 'css',
                        preText: 'https://youtu.be/' + result.items[0].id.videoId
                    })
                } else if (result.items[0].id.kind === 'youtube#channel') {
                    var description = result.items[0].snippet.description
                    while (description.indexOf('http') !== -1) {
                        description = description.replace('http://', '')
                        description = description.replace('https://', '')
                    }
                    messageSend(channelID, '\nTitle:       ' + result.items[0].snippet.title + ';\n\nDescription: ' + description + ' ;', {
                        cb: true,
                        type: 'css',
                        preText: 'https://www.youtube.com/channel/' + result.items[0].id.channelId
                    })
                } else if (result.items[0].id.kind === 'youtube#playlist') {
                    var description = result.items[0].snippet.description
                    while (description.indexOf('http') !== -1) {
                        description = description.replace('http://', '')
                        description = description.replace('https://', '')
                    }
                    messageSend(channelID, '\nTitle:       ' + result.items[0].snippet.title + ';\n\nDescription: ' + description + ';', {
                        cb: true,
                        type: 'css',
                        preText: 'https://www.youtube.com/playlist?list=' + result.items[0].id.playlistId
                    })
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
        game: {
            name: msg,
            url: "http://ratchtnet.com"
        }
    })
}
/*/Used to send messages and keep tack of the message id/*/
function messageSend(channelID, msg, set, callback) {
    try {
        if (set === undefined) {
            set = {
                cb: false,
                mention: false
            }
        }
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
    if (set.mention === true && set.cb === false) {
        msg = msg + ' <@' + userID + '>\n'
    }
    if (set.cb === true) {
        if (set.type !== undefined) {
            if (set.mention === true) {
                if (set.type === 'json') {
                    msg = JSON.stringify(msg, null, '\t')
                }
                if (set.preText !== undefined) {
                    msg = '<@' + set.userID + '> ' + set.preText + '\n```' + set.type + '\n' + msg + '```'
                } else {
                    msg = '<@' + set.userID + '>\n```' + set.type + '\n' + msg + '```'
                }
            } else {
                if (set.type === 'json') {
                    msg = JSON.stringify(msg, null, '\t')
                }
                if (set.preText !== undefined) {
                    msg = set.preText + '\n```' + set.type + '\n' + msg + '```'
                } else {
                    msg = '```' + set.type + '\n' + msg + '```'
                }
            }
        } else {
            if (set.mention === true) {
                if (set.preText !== undefined) {
                    msg = '<@' + set.userID + '> ' + set.preText + '\n\n```' + msg + '```'
                } else {
                    msg = '<@' + set.nuserID + '>\n```' + msg + '```'
                }
            } else {
                if (set.preText !== undefined) {
                    msg = set.preText + '\n```' + msg + '```'
                } else {
                    msg = '```' + msg + '```'
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
            if (typeof callback === "function") {
                var err = true;
                var res = error
                callback(err, res);
            }
            console.log(error)
        }
        try {
            logger.info(chalk.gray('Last Message Sent ID: ' + response.id))
            sentPrevId = response.id
            if (typeof callback === "function") {
                var err = false;
                var res = response.id
                callback(err, res);
            }
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
            //try {
            eval(line)
            // } catch (e) {
            //    logger.error(chalk.red("Bad JS Command " + e))
            //}
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
        messageSend(channelID, '<@' + userID + '> ' + 'rolled: ' + dienum.rolled.toString())
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
        messageSend(channelID, '<@' + userID + '>' + ' How can i roll a die with no dice to roll? :disappointed: (Note Accepted formats are numbers and die numbers such as d20 or 2d20')
    }
}
/*/Retrieves a relavant xkcd comic from a query/*/
function relxkcd(quer, channelID, name, sname) {
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
}
/*/Retrieves a current status of a user/*/
function status(statuscall, channelID, rawEvent, cl) {
    try {
        if (statuscall.toLowerCase().indexOf('<@') === -1) {
            var status = storage.d.Users[statuscall].status
            if (status === 'idle') {
                rawLastSeen = storage.d.Users[statuscall].rawLastSeen
                var ltsmsg = storage.d.Users[statuscall].lastseen
                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).utcOffset('-0500').format('MMMM Do YYYY, h:mm:ss a')
                var timeIdle = cmds.util.gettime() - rawLastSeen
                timeIdle = cmds.util.secondsToTime(timeIdle)
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
                if (cl) {
                    return timeIdle + " ago \n               (" + ltsmsg + ")"
                } else {
                    messageSend(channelID, statuscall + ": " + storage.d.Users[statuscall].status + "\nFor: " + timeIdle + "\nLastseen: " + ltsmsg, {
                        cb: true,
                        type: 'xl'
                    })
                }
            } else if (status === 'offline') {
                rawLastSeen = storage.d.Users[statuscall].rawLastSeen
                var ltsmsg = storage.d.Users[statuscall].lastseen
                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).utcOffset('-0500').format('MMMM Do YYYY, h:mm:ss a')
                var timeIdle = cmds.util.gettime() - rawLastSeen
                timeIdle = cmds.util.secondsToTime(timeIdle)
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
                if (cl) {
                    return timeIdle + " ago \n               (" + ltsmsg + ")"
                } else {
                    messageSend(channelID, statuscall + ": " + storage.d.Users[statuscall].status + "\nFor: " + timeIdle + "\nLastseen: " + ltsmsg, {
                        cb: true,
                        type: 'xl'
                    })
                }
            } else if (status === 'online') {
                if (cl) {
                    return "Currently Online"
                } else {
                    messageSend(channelID, statuscall + " Is currently online")
                }
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
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).utcOffset('-0500').format('MMMM Do YYYY, h:mm:ss a')
                        var timeIdle = cmds.util.gettime() - rawLastSeen
                        timeIdle = cmds.util.secondsToTime(timeIdle)
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
                        if (cl) {
                            return timeIdle + " ago \n               (" + ltsmsg + ")"
                        } else {
                            messageSend(channelID, usern + ": " + storage.d.Users[usern].status + "\nFor: " + timeIdle + "\nLastseen: " + ltsmsg, {
                                cb: true,
                                type: 'xl'
                            })
                        }
                    } else if (status === 'offline') {
                        rawLastSeen = storage.d.Users[usern].rawLastSeen
                        var ltsmsg = storage.d.Users[usern].lastseen
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, hh:mm:ss a']).utcOffset('-0500').format('MMMM Do YYYY, h:mm:ss a')
                        var timeIdle = cmds.util.gettime() - rawLastSeen
                        timeIdle = cmds.util.secondsToTime(timeIdle)
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
                        if (cl) {
                            return timeIdle + " ago \n               (" + ltsmsg + ")"
                        } else {
                            messageSend(channelID, usern + ": " + storage.d.Users[usern].status + "\nFor: " + timeIdle + "\nLastseen: " + ltsmsg, {
                                cb: true,
                                type: 'xl'
                            })
                        }
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
function cat(channelID, name, sname, messageID) {
    var cattime = cmds.util.gettime()
    if (storage.d.Servers[sname].Channels[name].lastCat === undefined) {
        storage.d.Servers[sname].Channels[name].lastCat = 0
        storage.d.Servers[sname].Channels[name].lastCatActt = 0
    }
    try {
        lastcattime = storage.d.Servers[sname].Channels[name].lastCat
        elapsed = cattime - lastcattime
        nextTime = lastcattime + 3600
        nextTime = nextTime - cattime
        nextTime = cmds.util.secondsToTime(nextTime)
        elapsed = cmds.util.secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        catacttime = storage.d.Servers[sname].Channels[name].lastCatActt
    } catch (e) {
        storage.d.Servers[sname].Channels[name].lastCat = 0
        storage.d.Servers[sname].Channels[name].lastCatActt = 0
    }
    if (elapsed.m > 45) {
        var catacttime = moment().utcOffset('-0500').format('h:mm a')
        storage.d.Servers[sname].Channels[name].lastCatActt = catacttime
        request('http://random.cat/meow', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                catJson = JSON.parse(body)
                messageSend(channelID, "Heres a cat! " + catJson.file)
                return elapsed
            }
        })
        var lastcattime = cmds.util.gettime()
        storage.d.Servers[sname].Channels[name].lastCat = lastcattime
    } else {
        tempmsg(channelID, ":no_entry: Hey hold up, only one cat per hour, last cat was posted: " + catacttime + ", time untill next post is allowed: " + nextTime, 5000)
        messageDelete(channelID, messageID)
        return elapsed
    }
}
/*/Posts a random snake picture, limit 1 per hour/*/
function snake(channelID, name, sname, userID, messageID) {
    var snaketime = cmds.util.gettime()
    if (storage.d.Servers[sname].Channels[name].lastsnake === undefined) {
        storage.d.Servers[sname].Channels[name].lastsnake = 0
        storage.d.Servers[sname].Channels[name].lastsnakeActt = 0
    }
    try {
        lastsnaketime = storage.d.Servers[sname].Channels[name].lastsnake
        elapsed = snaketime - lastsnaketime
        nextTime = lastsnaketime + 3600
        nextTime = nextTime - snaketime
        nextTime = cmds.util.secondsToTime(nextTime)
        elapsed = cmds.util.secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        snakeacttime = storage.d.Servers[sname].Channels[name].lastsnakeActt
    } catch (e) {
        storage.d.Servers[sname].Channels[name].lastsnake = 0
        storage.d.Servers[sname].Channels[name].lastsnakeActt = 0
    }
    if (elapsed.m > 45) {
        var snakeacttime = moment().utcOffset('-0500').format('h:mm a')
        storage.d.Servers[sname].Channels[name].lastsnakeActt = snakeacttime
        request('http://fur.im/snek/snek.php', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                snakeJson = JSON.parse(body)
                messageSend(channelID, "Heres a snake! " + snakeJson.file)
                return elapsed
            }
        })
        var lastsnaketime = cmds.util.gettime()
        storage.d.Servers[sname].Channels[name].lastsnake = lastsnaketime
    } else if (userID.indexOf('142484312862752768') !== -1) {
        request('http://fur.im/snek/snek.php', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                snakeJson = JSON.parse(body)
                messageSend(channelID, "Heres a snake for you william! " + snakeJson.file)
            }
        })
    } else {
        tempmsg(channelID, ":no_entry: Hey hold up, only one snake per hour, last snake was posted: " + snakeacttime + ", time untill next post is allowed: " + nextTime, 5000)
        messageDelete(channelID, messageID)
        return elapsed
    }
}
/*/Posts a random pug picture, limit 1 per hour/*/
function pug(channelID, name, sname, messageID) {
    var pugtime = cmds.util.gettime()
    if (storage.d.Servers[sname].Channels[name].lastpug === undefined) {
        storage.d.Servers[sname].Channels[name].lastpug = 0
        storage.d.Servers[sname].Channels[name].lastpugActt = 0
    }
    try {
        lastpugtime = storage.d.Servers[sname].Channels[name].lastpug
        elapsed = pugtime - lastpugtime
        nextTime = lastpugtime + 3600
        nextTime = nextTime - pugtime
        nextTime = cmds.util.secondsToTime(nextTime)
        elapsed = cmds.util.secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        pugacttime = storage.d.Servers[sname].Channels[name].lastpugActt
    } catch (e) {
        storage.d.Servers[sname].Channels[name].lastpug = 0
        storage.d.Servers[sname].Channels[name].lastpugActt = 0
    }
    if (elapsed.m > 45) {
        var pugacttime = moment().utcOffset('-0500').format('h:mm a')
        storage.d.Servers[sname].Channels[name].lastpugActt = pugacttime
        request('http://pugme.herokuapp.com/bomb?count=1', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                pugJson = JSON.parse(body)
                messageSend(channelID, "Heres a pug! " + pugJson.pugs[0])
                return elapsed
            }
        })
        var lastpugtime = cmds.util.gettime()
        storage.d.Servers[sname].Channels[name].lastpug = lastpugtime
    } else {
        tempmsg(channelID, ":no_entry: Hey hold up, only one pug per hour, last pug was posted: " + pugacttime + ", time untill next post is allowed: " + nextTime, 5000)
        messageDelete(channelID, messageID)
        return elapsed
    }
}
/*/Posts a random image from a SFW scenery subreddit/*/
function redditScenery(channelID, reddit, name, sname) {
    if (cmds.util.isInArray(reddit, redditList)) {
        var notif = messageSend(channelID, "Grabbing a image from reddit, this might take a few seconds...")
        request('https://www.reddit.com/r/' + reddit + 'porn' + '.json', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                redditJson = JSON.parse(body)
                posts = redditJson.data.children
                redditP = posts[Math.floor(Math.random() * posts.length)];
                img = redditP.data.url
                title = redditP.data.title
                messageSend(channelID, title + '\n' + img)
            }
        })
    } else {
        messageSend(channelID, "Not a recgonized image subreddit to see recgonized reddits type " + commandmod + "redditscenery list")
    }
}

function dragon(channelID, messageID) {
    tempmsg(channelID, "Getting you a dragon, hold on...", 2000)
    request('https://www.reddit.com/r/' + 'dragons' + '.json', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            redditJson = JSON.parse(body)
            posts = redditJson.data.children
            redditP = posts[Math.floor(Math.random() * posts.length)];
            img = redditP.data.url
            title = redditP.data.title
            messageSend(channelID, title + '\n' + img)
            messageDelete(channelID, messageID)
        }
    })
}

function aww(channelID, messageID) {
    tempmsg(channelID, "Getting you a cute picture, hold on...", 2000)
    request('https://www.reddit.com/r/' + 'aww' + '.json', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            redditJson = JSON.parse(body)
            posts = redditJson.data.children
            redditP = posts[Math.floor(Math.random() * posts.length)];
            img = redditP.data.url
            title = redditP.data.title
            messageSend(channelID, title + '\n' + img)
            messageDelete(channelID, messageID)
        }
    })
} /*/Help command/*/
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
        channelID: channelID,
        messageID: messageID
    })
}
/*/Sends a message then deletes it after a while/*/
function tempmsg(channelID, message, length) {
    bot.sendMessage({
        to: channelID,
        message: message,
        typing: false
    }, function(error, response) {
        setTimeout(function() {
            bot.deleteMessage({
                channelID: channelID,
                messageID: response.id
            })
        }, length)
    });
};
/*/Dekete multiple messages/*/
function messagesDelete(channelID, num) {
    bot.getMessages({
        channelID: channelID,
        limit: Number(num)
    }, function(error, messageArr) {
        if (error) {
            console.log(error)
        }
        bot.deleteMessages({
            channelID: channelID,
            messageIDs: messageArr.map(m => m.id)
        });
    });
}
/*/Magic 8 Ball/*/
function eightBall(channelID, question, userID) {
    var resp = doc.eBall[Math.floor(Math.random() * doc.eBall.length)];
    messageSend(channelID, '<@' + userID + '> ' + resp)
}
/*/Ask cleverbot a question/*/
function clever(channelID, userID, msg) {
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
        statW = cmds.util.whoIs(bot, storage, name, serverID)
        wLink = statW.substring(statW.indexOf('"h') + 1, statW.indexOf('g"') + 1)
        whoRest = statW.substring(0, statW.indexOf('Avatar'))
        request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + wLink + '&access_token=' + config.bitLy, function(error, response, body) {
            body = JSON.parse(body)
            thing = whoRest + 'Avatar:        "' + body.data.url + '"'
            lastSeen = status(name, null, rawEvent, true)
            messageSend(channelID, thing + "\n\n" +
                "Messages Sent: " + storage.d.Users[name].messageCnt + '\n' +
                "Links Sent:    " + storage.d.Users[name].linkCnt + '\n' +
                "Time Idle:     " + storage.d.Users[name].totalIdle.d + " Days " + storage.d.Users[name].totalIdle.h + " Hours " + storage.d.Users[name].totalIdle.m + " Minutes " + storage.d.Users[name].totalIdle.s + " Seconds\n" +
                "Time Offline:  " + storage.d.Users[name].totalOffline.d + " Days " + storage.d.Users[name].totalOffline.h + " Hours " + storage.d.Users[name].totalOffline.m + " Minutes " + storage.d.Users[name].totalOffline.s + " Seconds\n\n" +
                "First Seen:    " + storage.d.Users[name].tracking + "\n" +
                "Last Seen      " + lastSeen, {
                    cb: true,
                    type: 'xl'
                })
        })
    } else {
        try {
            var name = rawEvent.d.mentions[0].username
        } catch (e) {
            nmm = name.substring(name.indexOf('@'), name.indexOf('>'))
            for (var nmme in storage.d.Users) {
                if (storage.d.Users[nmme].id = nmm) {
                    name = nmme
                }
            }
        }
        /*for (var usern in storage.d.Users) {
            if (mentId === storage.d.Users[usern].id) {*/
        statW = cmds.util.whoIs(bot, storage, name, serverID)
        wLink = statW.substring(statW.indexOf('"h') + 1, statW.indexOf('g"') + 1)
        whoRest = statW.substring(0, statW.indexOf('Avatar'))
        request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + wLink + '&access_token=' + config.bitLy, function(error, response, body) {
            body = JSON.parse(body)
            thing = whoRest + 'Avatar:        "' + body.data.url + '"'
            lastSeen = status(name, null, rawEvent, true)
            messageSend(channelID, thing + "\n\n" +
                "Messages Sent: " + storage.d.Users[name].messageCnt + '\n' +
                "Links Sent:    " + storage.d.Users[name].linkCnt + '\n' +
                "Time Idle:     " + storage.d.Users[name].totalIdle.d + " Days " + storage.d.Users[name].totalIdle.h + " Hours " + storage.d.Users[name].totalIdle.m + " Minutes " + storage.d.Users[name].totalIdle.s + " Seconds\n" +
                "Time Offline:  " + storage.d.Users[name].totalOffline.d + " Days " + storage.d.Users[name].totalOffline.h + " Hours " + storage.d.Users[name].totalOffline.m + " Minutes " + storage.d.Users[name].totalOffline.s + " Seconds\n\n" +
                "First Seen:    " + storage.d.Users[name].tracking + "\n" +
                "Last Seen:     " + lastSeen, {
                    cb: true,
                    type: 'xl'
                })
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
/*/Url shortener/*/
function shorten(cl, ulink, channelID, userID, callback) {
    request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + ulink + '&access_token=' + config.bitLy, function(error, response, body) {
        body = JSON.parse(body)
        if (debug) {
            messageSend(channelID, body, {
                cb: true,
                type: 'json'
            })
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
        if (typeof callback === "function") {
            const err = false;
            const res = body.data.url
            callback(err, res);
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
                messageSend(channelID, body, {
                    cb: true,
                    type: 'json',
                    mention: true,
                    userID: userID
                })
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
                        messageSend(channelID, '' +
                            'Word:          ' + toSentenceCase(body[0].word) + '\n\n' +
                            'PartofSpeech:  ' + body[0].partOfSpeech + '\n' +
                            'Definition:    ' + body[0].text, {
                                cb: true,
                                type: 'xl',
                                mention: true,
                                userID: userID
                            })
                    }
                } catch (e) {
                    messageSend(channelID, "I couldent find the definition for that word", {
                        mention: true,
                        userID: userID
                    })
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
                messageSend(channelID, body, {
                    cb: true,
                    type: 'json'
                })
            }
            if (cl === false) {
                if (!error && response.statusCode === 200) {

                    messageSend(channelID, '' +
                        'Word:          ' + toSentenceCase(body.word) + ';\n\n' +
                        'PartOfSpeech:  ' + body.definitions[0].partOfSpeech + ';\n' +
                        'Definition:    ' + body.definitions[0].text + ';\n\n' +
                        'ExampleUseage: ' + body.examples[0].text + ';\n' +
                        'CitedFrom:     ' + body.examples[0].title + ';\n\n' +
                        'Url:           ' + body.examples[0].url + ';', {
                            cb: true,
                            type: 'css',
                            mention: true,
                            userID: userID
                        })
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
/*/Totals all user messages/*/
function totalOfAll(channelID, verb, cl) {
    var totalofall = 0;
    var message = ''
    for (var servername in storage.d.Servers) {
        message = message + servername + ":  " + storage.d.Servers[servername].messageCnt + '\n\n'
        totalofall = totalofall + storage.d.Servers[servername].messageCnt
    };
    if (verb) {
        messageSend(channelID, message + 'All: ' + totalofall)
    } else {
        if (cl) {
            return totalOfAll
        } else {
            messageSend(channelID, "Total Of All Messages: " + totalofall)
        }
    }
}
//admin functions
function admin(id, userID, type) {
    bot[type]({
        channel: id,
        target: userID
    })
}
//mySQL query
function DBquery(channelID, query) {
    db.con.query(query, function(err, rows) {
        if (err) {
            messageSend(channelID, err, {
                cb: true,
                type: 'fix'
            })
        } else {
            messageSend(channelID, rows, {
                cb: true,
                type: 'json'
            }, function(err, r) {
                if (err) {
                    messageSend(channelID, r, {
                        cb: true,
                        type: 'json'
                    })
                }
            })
        }
    })
}
//Pins a message
function pin(channelID, msg) {
    messageSend(channelID, msg, {}, function(res) {
        bot.pinMessage({
            channelID: channelID,
            messageID: res
        })
    })
}
//Hard Mutes someone
function mute(sname, userID, un) {
    if (un) {
        if (storage.d.Servers[sname].muted === undefined) {
            storage.d.Servers[sname].muted = []
        }
        var index = storage.d.Servers[sname].muted.indexOf(userID)
        storage.d.Servers[sname].muted.splice(index, 1)
        console.log(userID + " Has been Un-muted")
    } else {
        if (storage.d.Servers[sname].muted === undefined) {
            storage.d.Servers[sname].muted = []
        }
        storage.d.Servers[sname].muted.push(userID)
        console.log(userID + " Has been muted")
    }
}

function aD(phrase, channelID) {
    db.clq({
        type: 'insert',
        location: 'autoDel',
        change: [
            [
                'id',
                'channelID',
                'phrase'
            ],
            [
                shortid.generate(),
                channelID,
                phrase
            ]
        ]
    })
}

disc = false
var startUpTime = null
    /* Bot on event functions */
var update = schedule.scheduleJob('*/5 * * * *', function() {
    cmds.list.server(bot, storage, false)
    cmds.list.channel(bot, storage, false)
    cmds.list.user(bot, storage, false)
});
bot.on('ready', function() {
    logger.info(chalk.blue("Rebuilding tracked servers, users, and channels. This could take a while...\n"))
    if (disc === false) {
        startUpTime = cmds.util.gettime()
    }
    cmds.list.server(bot, storage, false, true)
    cmds.list.channel(bot, storage, false, true)
    cmds.list.user(bot, storage, false, true)
    logger.info(chalk.magenta(bot.username + " -- (" + bot.id + ")" + " Is now running"))
    statusmsg("help | info | invite")
});
bot.on('any', function(rawEvent) {
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
            messageSend(announceID, "@everyone <@" + rawEvent.d.user.id + "> Just joined the server! welcome " + rawEvent.d.user.username + " to " + bot.servers[rawEvent.d.guild_id].name + "!")
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
        if (startupF) {
            messageSend('174257824761774080', "I have been added to a new server: " + name + " with the id of: " + serverID)
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
        cmds.list.channel(bot, storage)
    }
    if (rawEvent.t === "CHANNEL_UPDATE") {
        sname = bot.servers[rawEvent.d.guild_id].name
        cID = rawEvent.d.id
        newName = rawEvent.d.name
        topic = rawEvent.d.topic
        logger.info(chalk.gray("Channel just updated on: " + sname + ", Channel Name: " + newName + " Topic: " + topic))
        for (var cname in storage.d.Servers[sname].Channels) {
            if (storage.d.Servers[sname].Channels[cname].id === cID) {
                storage.d.Servers[sname].Channels[newName] = storage.d.Servers[sname].Channels[cname]
                storage.d.Servers[sname].Channels[newName].topic = topic
                delete storage.d.Servers[sname].Channels[cname]
            }
        }
    }
    if (rawEvent.t === "MESSAGE_DELETE") {
        if (rawEvent.d.channel_ID === '148129145791053824') {
            messageSend('208259203066757131', 'A message was just deleted in <#' + rawEvent.d.channel_ID + '>')
        }
    }
});
bot.on('disconnect', function() {
    var disc = true
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
                var lastseen = moment().utcOffset('-0500').format('MMMM Do YYYY, hh:mm:ss a')
                storage.d.Users[user].lastseen = lastseen
                storage.d.Users[user].rawLastSeen = cmds.util.gettime()
                if (storage.d.Users[user].status !== 'offline' && verb) {
                    logger.info(chalk.gray(lastseen + ' : ' + chalk.red(user + " is now: " + chalk.underline(status))));
                }
                storage.d.Users[user].status = status
            } else if (user === undefined) {
                var lastseen = moment().utcOffset('-0500').format('MMMM Do YYYY, hh:mm:ss a')
                storage.d.Users[user].rawLastSeen = cmds.util.gettime()
                for (var user in storage.d.Users) {
                    if (userID === storage.d.Users[user].id) {
                        storage.d.Users[user].lastseen = lastseen
                        storage.d.Users[user].rawLastSeen = cmds.util.gettime()
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
            var lastseen = moment().utcOffset('-0500').format('MMMM Do YYYY, hh:mm:ss a')
            storage.d.Users[user].lastseen = lastseen
            storage.d.Users[user].rawLastSeen = cmds.util.gettime()
            if (storage.d.Users[user].status !== 'idle' && verb) {
                logger.info(chalk.gray(lastseen + ' : ' + chalk.yellow(user + " is now: " + chalk.underline(status))));
            }
            storage.d.Users[user].status = status
        }
        if (status === 'online') {
            var lastseen = moment().utcOffset('-0500').format('MMMM Do YYYY, hh:mm:ss a')
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
                    var previousIdle = cmds.util.secondsToTime(cmds.util.gettime() - storage.d.Users[user].rawLastSeen)
                    lastIdleTime.d = lastIdleTime.d + previousIdle.d
                    lastIdleTime.h = lastIdleTime.h + previousIdle.h
                    lastIdleTime.m = lastIdleTime.m + previousIdle.m
                    lastIdleTime.s = lastIdleTime.s + previousIdle.s
                    lastIdleTime.m = lastIdleTime.m * 60
                    lastIdleTime.h = lastIdleTime.h * 3600
                    lastIdleTimeC = lastIdleTime.m + lastIdleTime.s + lastIdleTime.h
                    lastIdleTimeC = cmds.util.secondsToTime(lastIdleTimeC)
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
                    var previousOffline = cmds.util.secondsToTime(cmds.util.gettime() - storage.d.Users[user].rawLastSeen)
                    lastOfflineTime.d = lastOfflineTime.d + previousOffline.d
                    lastOfflineTime.h = lastOfflineTime.h + previousOffline.h
                    lastOfflineTime.m = lastOfflineTime.m + previousOffline.m
                    lastOfflineTime.s = lastOfflineTime.s + previousOffline.s
                    lastOfflineTime.m = lastOfflineTime.m * 60
                    lastOfflineTime.h = lastOfflineTime.h * 3600
                    lastOfflineTimeC = lastOfflineTime.m + lastOfflineTime.s + lastOfflineTime.h
                    lastOfflineTimeC = cmds.util.secondsToTime(lastOfflineTimeC)
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
    if (user.indexOf("\'")) {
        user.replace("\'", "")
    }
    //Gets the message id and server id
    var messageID = rawEvent.d.id
    meta = {
        userID: userID,
        user: user,
        channelID: channelID,
        serverID: serverID,
        serverName: sname,
        channelName: cname,
        messageID: messageID,
        rawEvent: rawEvent
    }
    console.log(meta)
    db.clq({
        type: 'select',
        what: '*',
        location: 'autoDel'
    }, function(e, r) {
        for (var i = 0; i < r.length; i++) {
            try {
                if (message.indexOf(r[i].phrase) !== -1 && r[i].channelID === channelID) {
                    messageDelete(channelID, messageID)
                }
            } catch (e) { /**/ }
        }
    })
    try {
        var serverID = bot.channels[channelID].guild_id
        var cname = bot.servers[serverID].channels[channelID].name
        var sname = bot.servers[serverID].name
        if (storage.d.Servers[sname].SownerId !== undefined) {
            var SownerId = storage.d.Servers[sname].SownerId
        }

        try {
            verb = storage.d.Servers[sname].settings.verb
        } catch (e) {
            verb = false
            try {
                storage.d.Servers[sname].settings.verb = false
            } catch (e) {
                /**/
            }
        }
        if (storage.d.Servers[sname].Channels[cname].nsfw === true) {
            nsfw = true
        } else {
            nsfw = false
        }
        if (storage.d.Servers[sname].settings.prefixOvrid !== undefined) {
            commandmod = storage.d.Servers[sname].settings.prefixOvrid
        } else {
            commandmod = '!'
        }
        if (rawEvent.d.mentions[0].id !== undefined) {
            if (rawEvent.d.mentions[0].id === bot.id) {
                if (message.indexOf('<@') === 0) {
                    message = message.replace("<@" + bot.id + "> ", commandmod)
                }
            }
        }
    } catch (e) {
        error = true
        try {
            storage.d.Servers[sname].Channels[cname].nsfw = false
        } catch (e) {
            /**/
        }
        nsfw = false
    }
    //Logging Related
    db.clq({
        type: 'select',
        what: 'userid, msgCnt, lastChat, rawLastChat',
        location: 'users',
        id: 'userID',
        where: userID
    }, function(err, res) {
        try {
            if (res[0] === undefined) {
                db.clq({
                    type: 'insert',
                    location: 'users',
                    change: [
                        [
                            'userid',
                            'name',
                            'msgCnt',
                            'lastchat',
                            'rawLastChat',
                            'tracking'
                        ],
                        [
                            userID,
                            user,
                            '1',
                            moment().format('MMMM Do YYYY, hh:mm:ss a'),
                            cmds.util.gettime(),
                            moment().format('MMMM Do YYYY, hh:mm:ss a')
                        ]
                    ]
                })
            } else {
                db.clq({
                    type: 'update',
                    location: 'users',
                    id: 'userID',
                    where: userID,
                    change: [
                        [
                            'name',
                            'msgCnt',
                            'lastChat',
                            'rawLastChat'
                        ],
                        [
                            user,
                            res[0].msgCnt + 1,
                            moment().format('MMMM Do YYYY, hh:mm:ss a'),
                            cmds.util.gettime()
                        ]
                    ]
                }, function(e, r) {
                    if (e !== null) {
                        console.log(e)
                    }
                })
            }
        } catch (E) {
            console.log(E)
        }
    })
    if (rawEvent.d.attachments[0] !== undefined) {
        message = message + ' ' + rawEvent.d.attachments[0].url
    }
    if (message.toLowerCase().indexOf('http') !== -1) {
        var timeAt = moment().utcOffset('-0500').format('MMMM Do YYYY, hh:mm:ss a')
        if (message.indexOf(' ', message.indexOf('http')) === -1) {
            var link = '[' + timeAt + '] ' + user + ': ' + message.substring(message.indexOf('http'))
        } else if (message.indexOf(' ', message.indexOf('http')) !== -1) {
            var link = '[' + timeAt + '] ' + user + ': ' + message.substring(message.indexOf('http'), message.indexOf(' ', message.indexOf('http')))
        }
        db.clq({
            type: 'select',
            what: 'userid, linkCnt',
            location: 'users',
            id: 'userID',
            where: userID
        }, function(err, res) {
            try {
                if (res[0] === undefined) {
                    db.clq({
                        type: 'insert',
                        location: 'users',
                        change: [
                            ['userid', 'name', 'linkCnt', 'lastchat', 'rawLastChat', 'tracking'],
                            [
                                userID,
                                user,
                                '1',
                                moment().format('MMMM Do YYYY, hh:mm:ss a'),
                                cmds.util.gettime(),
                                moment().format('MMMM Do YYYY, hh:mm:ss a')
                            ]
                        ]
                    })
                } else {
                    db.clq({
                        type: 'update',
                        location: 'users',
                        id: 'userID',
                        where: userID,
                        change: [
                            ['name', 'linkCnt', 'lastChat', 'rawLastChat'],
                            [
                                user,
                                res[0].linkCnt + 1,
                                moment().format('MMMM Do YYYY, hh:mm:ss a'),
                                cmds.util.gettime()
                            ]
                        ]
                    }, function(e, r) {
                        if (e !== null) {
                            console.log(e)
                        }
                    })
                }
            } catch (E) {
                console.log(E)
            }
        })
        mkdirp('./logs/' + sname, function(err) {
            try {
                if (nsfw) {
                    fs.appendFile("logs/" + sname + "/LinksNSFW.txt", '\n' + link)
                } else {
                    fs.appendFile("logs/" + sname + "/Links.txt", '\n' + link)
                }
            } catch (e) { /**/ }
        })
    }
    if (cname !== undefined) {
        db.clq({
            type: 'select',
            what: 'channelID, messageCnt',
            location: 'channels',
            id: 'channelID',
            where: channelID
        }, function(err, res) {
            try {
                if (res[0] === undefined) {
                    db.clq({
                        type: 'insert',
                        location: 'channels',
                        change: [
                            ['channelID', 'serverID', 'name', 'messageCnt'],
                            [
                                channelID,
                                serverID,
                                cname,
                                '1'
                            ]
                        ]
                    })
                } else {
                    db.clq({
                        type: 'update',
                        location: 'channels',
                        id: 'channelID',
                        where: channelID,
                        change: [
                            ['messageCnt'],
                            [
                                res[0].messageCnt + 1
                            ]
                        ]
                    }, function(e, r) {
                        if (e !== null) {
                            console.log(e)
                        }
                    })
                }
            } catch (E) {
                console.log(E)
            }
        })
    }
    if (sname !== undefined) {
        db.clq({
            type: 'select',
            what: 'serverid, messageCnt',
            location: 'servers',
            id: 'serverid',
            where: serverID
        }, function(err, res) {
            try {
                if (res[0] === undefined) {
                    db.clq({
                        type: 'insert',
                        location: 'channels',
                        change: [
                            ['serverid', 'name', 'messageCnt', 'sOwnerId'],
                            [
                                serverID,
                                sname,
                                '1',
                                bot.servers[serverID].owner_id
                            ]
                        ]
                    })
                } else {
                    db.clq({
                        type: 'update',
                        location: 'servers',
                        id: 'serverid',
                        where: serverID,
                        change: [
                            ['messageCnt'],
                            [
                                res[0].messageCnt + 1
                            ]
                        ]
                    }, function(e, r) {
                        if (e !== null) {
                            console.log(e)
                        }
                    })
                }
            } catch (E) {
                console.log(E)
            }
        })
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
    /**COMMAND RECGONITION**/
    if (message.indexOf(commandmod) === 0) {
        message = message.replace(commandmod, '')
        if (message.toLowerCase().indexOf('ping') === 0 && ignore !== true) {
            messageSend(channelID, 'pong')
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('help') === 0 && ignore !== true) {

            if (message.indexOf(' ') === -1) {
                cList = "[help](Prints out the help doc for any Command)     \n"
                cList2 = ""
                messageSend(channelID, "Check your PM's :mailbox_with_mail:")
                for (var i = 0; i < doc.cList.length; i++) {
                    if (i < doc.cList.length - 1) {
                        if (cList.length < 1800) {
                            if (doc.help[doc.cList[i]].type === "Admin") {
                                cList = cList + '[' + doc.cList[i] + "]" + "[" + doc.help[doc.cList[i]].help + "]\n"
                            } else {
                                cList = cList + '[' + doc.cList[i] + "]" + "(" + doc.help[doc.cList[i]].help + ")\n"
                            }
                        } else {
                            if (doc.help[doc.cList[i]].type === "Admin") {
                                cList2 = cList2 + '[' + doc.cList[i] + "]" + "[" + doc.help[doc.cList[i]].help + "]\n"
                            } else {
                                cList2 = cList2 + '[' + doc.cList[i] + "]" + "(" + doc.help[doc.cList[i]].help + ")\n"
                            }
                        }
                    }
                }
                messageSend(userID, cList, {
                    cb: true,
                    type: 'md',
                    preText: "Here are my commands Yellow = Admin"
                })
                if (cList2.length > 2) {
                    setTimeout(function() {
                        messageSend(userID, cList2, {
                            cb: true,
                            type: 'md'
                        })
                    }, 200);
                }
            } else {
                helpcall = message.substring(message.indexOf(' ') + 1)
                help(helpcall, channelID)
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('info') === 0 && ignore !== true) {
            cmds.list.server(bot, storage, false, true)
            cmds.list.channel(bot, storage, false, true)
            cmds.list.user(bot, storage, false, true)
            messageSend(channelID, serverCnt + " Servers\n" +
                channelCnt + " Channels\n" +
                userCnt + " Users\n", {
                    cb: true,
                    type: 'xl',
                    mention: true,
                    userID: userID,
                    preText: doc.info + "\n\nHere is Scratch's current count of servers, channels, ans users seen"
                })
            rconcmd = 'Yes'
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
        if (message.toLowerCase().indexOf('poke') === 0 && ignore !== true) {
            var pkcall = rawEvent.d.mentions[0].id
            message = message.replace('poke', '')
            messageSend(pkcall, "Hi <@" + pkcall + "> You where poked by: <@" + userID + "> in: <#" + channelID + "> With the following message: " + message)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('stats') === 0 && ignore !== true) {
            var len = message.length
            var name = message.substring(message.indexOf(' ') + 1)
            messageSend(channelID, 'Please note these stats _Will_ not be accurate! Currently migrating the database to a new format so the old system is in place untill it is updated, but that also means that the triggers that updates your stats wont be present, but dont worry they are still being updated')
            if (len === 5) {
                try {
                    cmds.util.whoIs(bot, storage, user, serverID, true, function(err, statW) {
                        wLink = statW.substring(statW.indexOf('"h') + 1, statW.indexOf('g"') + 1)
                        whoRest = statW.substring(0, statW.indexOf('Avatar'))
                        request('https://api-ssl.bitly.com/v3/shorten?longUrl=' + wLink + '&access_token=' + config.bitLy, function(error, response, body) {
                            body = JSON.parse(body)
                            thing = whoRest + 'Avatar:        "' + body.data.url + '"'
                            messageSend(channelID, thing + '\n\n' +
                                "Messages Sent: " + storage.d.Users[user].messageCnt + '\n' +
                                "Links Sent:    " + storage.d.Users[user].linkCnt + '\n' +
                                "Time Idle:     " + storage.d.Users[user].totalIdle.d + " Days " + storage.d.Users[user].totalIdle.h + " Hours " + storage.d.Users[user].totalIdle.m + " Minutes " + storage.d.Users[user].totalIdle.s + " Seconds\n" +
                                "Time Offline:  " + storage.d.Users[user].totalOffline.d + " Days " + storage.d.Users[user].totalOffline.h + " Hours " + storage.d.Users[user].totalOffline.m + " Minutes " + storage.d.Users[user].totalOffline.s + " Seconds\n\n" +
                                "First Seen:    " + storage.d.Users[user].tracking, {
                                    cb: true,
                                    type: 'xl',
                                    mention: true,
                                    userID: userID
                                })
                        })
                    })
                } catch (e) {
                    messageSend(channelID, 'There was a error pulling your stats from the database')
                    console.log(e)
                }
            } else if (message.toLowerCase().indexOf('server') !== -1) {
                messageSend(channelID, storage.d.Servers[sname].messageCnt + "Messages", {
                    cb: true,
                    type: 'xl'
                })
            } else if (message.toLowerCase().indexOf('channel') !== -1) {
                messageSend(channelID, storage.d.Servers[sname].Channels[cname].messageCnt + 'Messages', {
                    cb: true,
                    type: 'xl'
                })
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
                messagesDelete(channelID, Number(pcall) + 1)
                setTimeout(function() {
                    messageSend(channelID, 'Ok removed the last ' + pcall + " Messages")
                }, 500)
            } else if (userID.indexOf(SownerId) === 0 && userID.indexOf(ownerId) === -1) {
                messagesDelete(channelID, Number(pcall) + 1)
                setTimeout(function() {
                    messageSend(channelID, 'Ok removed the last ' + pcall + " Messages")
                }, 500)
            } else {
                messageSend(channelID, "You are not allowed to do that command, you need to be either the bot or server owner/Admin")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('mtg') === 0 && ignore !== true) {
            mtg = message.substring(message.indexOf(' ') + 1)
            cmds.mtg(bot, messageSend, channelID, mtg)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('prefix') === 0 && ignore !== true) {
            var pfcmd = message
            var pfcall = pfcmd.replace('prefix ', '')
            if (userID.indexOf(ownerId) === 0) {
                if (pfcmd.indexOf(' ') !== -1) {
                    storage.d.Servers[sname].settings.prefixOvrid = pfcall
                    messageSend(channelID, "The prefix for this server is now: " + pfcall)
                } else {
                    messageSend(channelID, "You didn't provide a prefix!")
                }
            } else if (userID.indexOf(SownerId) === 0 && userID.indexOf(ownerId) === -1) {
                if (pfcmd.indexOf(' ') !== -1) {
                    storage.d.Servers[sname].settings.prefixOvrid = pfcall
                    messageSend(channelID, "The prefix for this server is now: " + pfcall)
                } else {
                    messageSend(channelID, "You didn't provide a prefix!")
                }
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
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('vl') === 0 && ignore !== true) {
            vl = message.substring(message.indexOf(' ') + 1)
            if (vl.indexOf('nickname') !== -1) {
                vlf = message.replace('vl ', '')
                vlf = message.replace('nickname ', '')
                fileN = vlf.substring(vlf.indexOf(' ') + 1, vlf.indexOf('|'))
                Nname = vlf.substring(vlf.indexOf('|') + 1)
                cmds.voiceLines.nickname(fileN, Nname, bot, channelID)
            } else if (vl.indexOf('list') !== -1) {
                if (vl.indexOf('new') !== -1) {
                    cmds.voiceLines.list()
                    setTimeout(function() {
                        messageSend(channelID, cmds.voiceLines.newFiles, {
                            cb: true,
                            type: 'json'
                        })
                    }, 500)
                } else {
                    messageSend(channelID, cmds.voiceLines.vlJ.nicknames, {
                        cb: true,
                        type: 'json'
                    })
                }
            } else {
                cmds.voiceLines.play(bot, meta, vl)
            }
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('vp') === 0 && ignore !== true) {
            vp = message.substring(message.indexOf(' ') + 1)
            rconcmd = "Yes"
            cmds.vp.play(bot, serverID, userID, channelID, vp)
        }
        if (message.toLowerCase().indexOf('8ball') === 0 && ignore !== true) {
            ebQ = message.substring(message.indexOf(' ') + 1)
            eightBall(channelID, ebQ, userID)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('xkcd') === 0 && ignore !== true) {
            if (message.indexOf(' ') === -1) {
                xkcd.img(function(err, res) {
                    if (!err) {
                        messageSend(channelID, res.title + "\n" + res.url)
                    }
                });
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
            rconcmd = 'Yes'
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
            cat(channelID, cname, sname, messageID)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('ad') === 0 && ignore !== true) {
            phrase = message.substring(message.indexOf(' ') + 1)
            roles = bot.servers[serverID].members[userID].roles
            permissions = []
            manage_messagesCheck = []
            if (roles.length !== 0) {
                for (var i = 0; i < roles.length; i++) {
                    permissions.push(bot.servers[serverID].roles[roles[i]].permissions)
                }
            }
            for (var i = 0; i < permissions.length; i++) {
                manage_messagesCheck.push(perm.decodePerm(permissions[i]).CHAT_MANAGE_MESSAGES)
                manage_messagesCheck.push(perm.decodePerm(permissions[i]).GEN_ADMINISTRATOR)
            }
            var stop = false
            for (var i = 0; i < manage_messagesCheck.length; i++) {
                if (manage_messagesCheck[i] && stop === false) {
                    var stop = true
                    aD(phrase, channelID)
                    messageSend(channelID, "That phrase will now be automatically deleted")
                } else if (userID === SownerId && stop === false) {
                    var stop = true
                    aD(phrase, channelID)
                    messageSend(channelID, "That phrase will now be automatically deleted")
                }
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('pin') === 0 && message.toLowerCase().indexOf('ping') === -1 && ignore !== true) {
            var pincmd = message
            var pincall = pincmd.replace('pin ', '')
            if (ownerId === userID || serverID === '162390519748624384') {
                pin(channelID, '<@' + userID + '>: ' + pincall)
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('query') === 0 && ignore !== true) {
            var queryCmd = message
            var queryCall = queryCmd.replace('query ', '')
            if (ownerId === userID) {
                DBquery(channelID, queryCall)
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('snake') === 0 && ignore !== true) {
            snake(channelID, cname, sname, userID, messageID)
            rconcmd = 'Yes'
        }
        rconcmd = 'Yes'
        if (message.toLowerCase().indexOf('pug') === 0 && ignore !== true) {
            pug(channelID, cname, sname, messageID)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('dragon') === 0 && ignore !== true) {
            messageDelete(channelID, messageID)
            dragon(channelID)
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('aww') === 0 && ignore !== true) {
            messageDelete(channelID, messageID)
            aww(channelID)
            rconcmd = "Yes"
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
            rconcmd = "Yes"
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
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('uptime') === 0 && ignore !== true) {
            time = cmds.util.secondsToTime(cmds.util.gettime() - startUpTime)
            messageSend(channelID, "The bot has been active for: " + time.d + " Days " + time.h + " Hours " + time.m + " Minutes " + time.s + " Seconds")
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('us') === 0 && ignore !== true) {
            var uri = message.substring(message.indexOf(' ') + 1)
            unShorten(channelID, userID, uri)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('invite') === 0 && ignore !== true) {
            messageSend(channelID, "Here is my invite link: https://goo.gl/wwrmZi \nIf you dont trust short urls use the following command to unshorten it: " + commandmod + "us https://goo.gl/wwrmZi \n\nBy default the bot is set to have all permissions, just pick what you want it to have, at a minimum it needs read and manage messages")
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('js') === 0) {
            jscall = message.substring(message.indexOf(' ') + 1)
            if (userID.indexOf(ownerId) === 0) {
                try {
                    eval(jscall)
                } catch (e) {
                    logger.error(chalk.red("Bad JS Command " + e))
                    messageSend(channelID, e, {
                        cb: true,
                        type: 'fix'
                    })
                }
            } else {
                messageSend(channelID, '<@' + userID + "> You are not allowed to use this command, only the owner of the bot can because it can damage the bot")
            }
            rconcmd = 'Yes'
        } else {
            if (rconcmd === 'No') {
                //clever(channelID,userID,message)
            }
        }
    }
    /****/
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
        var timed = moment().utcOffset('-0500').format('MMMM Do YYYY, h:mm:ss a ')
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
                    console.log('\n' + timed + ' Channel: ' + chalk.blue(servern + '/' + channeln) + ' |\n' + chalk.cyan(user + ': ') + message)
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