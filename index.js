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

/*/Loads Storage.json if it exists/*/
if (fs.existsSync('./assets/storage.json')) {
    console.log('Found Storage.json');
    var storage = require('./assets/storage.json')
}
else if (fs.existsSync('./assets/storage.json') === false) {
    logger.info(chalk.underline.blue('Didnt Find Storage.json, Please run generateStorageFile.js'))
}
/*/Load Up a Youtube Api Key /*/
youTube.setKey(config.youTubeApiKey);
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

/* Start of function defining */
if (storage.settings.redditList === undefined) {
    storage.settings.redditList = []
    redditList = storage.settings.redditList
}
else {
    redditList = storage.settings.redditList
}

/*/Function to write json to the storage file/*/
function writeJSON(path, data, callback) {
    fs.writeFile(path + '.tmp', JSON.stringify(data), function(error) {
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
/*/Converts Seconds to hh mm ss/*/
function secondsToTime(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
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
function serverlist(verb) {
    if (verb) {
        logger.info(chalk.underline("Currently connected to these servers: \n"))
    }
    for (var serverID in bot.servers) {
        if (verb) {
            console.log(bot.servers[serverID].name)
        }
        var name = bot.servers[serverID].name;
        var SownerId = bot.servers[serverID].owner_id
        if (storage.d.Servers[name] === undefined) {
            storage.d.Servers[name] = {
                'id': serverID,
                'messageCnt': 0,
                'announceChan': null,
                'SownerId': SownerId
            }
        }
        else {
            if (storage.d.Servers[name].messageCnt === undefined) {
                storage.d.Servers[name].messageCnt = 0
            }
            if (storage.d.Servers[name].announceChan === undefined) {
                storage.d.Servers[name].announceChan = null
            }
            if (storage.d.Servers[name].SownerId === undefined) {
                storage.d.Servers[name].SownerId = SownerId
            }
        }
    }
    writeJSON('./storage', storage)
}
/*/Lists currencly seen channels/*/
function channellist(verb) {
    if (verb) {
        logger.info(chalk.underline("Currently connected to these channels: \n"))
    }
    for (var serverID in bot.servers) {
        for (var channelID in bot.servers[serverID].channels) {
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
            }
            else {
                storage.d.Servers[sname].Channels[name].id = channelID
                storage.d.Servers[sname].Channels[name].type = type
                if (type !== "voice") {
                    if (storage.d.Servers[sname].Channels[name].messageCnt === undefined) {
                        storage.d.Servers[sname].Channels[name].messageCnt = 0
                    }
                    if (storage.d.Servers[sname].Channels[name].lastComicActt === undefined) {
                        storage.d.Servers[sname].Channels[name].lastComicActt = null
                    }
                    if (storage.d.Servers[sname].Channels[name].lastComic === undefined) {
                        storage.d.Servers[sname].Channels[name].lastComic = null
                    }
                }
            }
        }
    }
    writeJSON('./storage', storage)
}
/*/List currently/*/
function userlist(verb) {
    if (verb) {
        logger.info(chalk.underline("Currently seeing these users: \n"))
    }
    for (var serverID in bot.servers) {
        for (var userID in bot.servers[serverID].members) {
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
            }
            else {
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
            }
        }
    }
    writeJSON('./storage', storage)
}
/*/Quick way of checking if something is in a array/*/
function isInArray(value, array) {
    return array.indexOf(value) > -1;
}
/*/Used to Ignore Channels/*/
function ignoreC(cID) {
    try {
        storage.settings.ignoredChannels.push(cID)
        return true
    }
    catch (e) {
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
    }
    catch (e) {
        return false
    }
}
/*/YouTube Search/*/
function yt(ytcall, userID, channelID) {
    youTube.search(ytcall, 1, function(error, result) {
        if (error) {
            logger.error(chalk.red(error));
        }
        else {
            try {
                if (result.items[0].id.kind === 'youtube#video') {
                    var description = result.items[0].snippet.description
                    while (description.indexOf('http') !== -1) {
                        description = description.replace('http://', '')
                        description = description.replace('https://', '')
                    }

                    messageSend(channelID, '<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\n\nDescription: ' + description + '\nhttps://youtu.be/' + result.items[0].id.videoId)
                }
                else if (result.items[0].id.kind === 'youtube#channel') {
                    while (result.items[0].id.kind === 'youtube#video') {
                        var description = result.items[0].snippet.description
                        if (description.indexOf('http') !== -1) {
                            description = description.replace('http://', '')
                            description = description.replace('https://', '')
                        }
                    }
                    messageSend(channelID, '<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\nDescription: ' + description + '\nhttps://www.youtube.com/channel/' + result.items[0].id.channelId)
                }
                else if (result.items[0].id.kind === 'youtube#playlist') {
                    if (result.items[0].id.kind === 'youtube#video') {
                        var description = result.items[0].snippet.description
                        while (description.indexOf('http') !== -1) {
                            description = description.replace('http://', '')
                            description = description.replace('https://', '')
                        }
                    }
                    messageSend(channelID, '<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\nDescription: ' + description + '\nhttps://www.youtube.com/playlist?list=' + result.items[0].id.playlistId)
                }
                else {
                    messageSend(channelID, '<@' + userID + '> Sorry I could not retrieve that :confused:')
                }
            }
            catch (e) {
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
        idle_since: Date.now(),
        game: msg
    })
}
/*/Used to send messages and keep tack of the message id/*/
function messageSend(channelID, msg) {
    bot.sendMessage({
        to: channelID,
        message: msg,
        typing: false
    }, function(error, response) {
        try {
            logger.info(chalk.dim('Last Message Sent ID: ' + response.id))
            sentPrevId = response.id
        }
        catch (e) {
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
            logger.info(chalk.dim("Now talking in channel: " + cnaid))
        }
        else if (line.toLowerCase().indexOf('cnch') === 1) {
            var serv = line.substring(line.indexOf(' ') + 1)
            var serve = serv.substring(0, line.indexOf(' '))
            var chann = serv.substring(serv.indexOf(' ') + 1)
            for (var server in storage.d.Servers) {
                if (server === serve) {
                    for (var channel in storage.d.Servers[server].Channels) {
                        if (channel === chann) {
                            cnaid = storage.d.Servers[serv].Channels[chann].id
                            logger.info(chalk.dim("Now talking in channel: " + cnaid + "/" + channel))
                            return
                        }
                        else {
                            continue
                        }
                    }
                }
                else {
                    continue
                }
            }
        }
        else {
            try {
                eval(line)
            }
            catch (e) {
                logger.error(chalk.red("Bad JS Command " + e))
            }
        }
    }
    else if (line.toLowerCase().indexOf('~') !== 0) {
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
        }
        else if (numdie > 21) {
            messageSend(channelID, '<@' + userID + '>' + ' Please roll no more than 20 dice')
        }
    }
    //If now die are thrown toss this
    if (dice.indexOf('d') === -1) {
        messageSend(channelID, '<@' + userID + '>' + ' How can i roll a die with no dice to roll? :disappointed:')
    }
}
/*/Quick way to delete messages/*/
function messageDelete(channelID, messageID) {
    bot.deleteMessage({
        channel: channelID,
        messageID: messageID
    })
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
    }
    catch (e) {
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
    }
    else {
        messageSend(channelID, ":no_entry: Hey hold up, only one comic per hour, last comic was posted: " + comicacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    writeJSON('./storage', storage)
}
/*/Retrieves a current status of a user/*/
function status(statuscall, channelID, rawEvent) {
    try {
        if (statuscall.toLowerCase().indexOf('<@') === -1) {
            var status = storage.d.Users[statuscall].status
            if (status === 'idle') {
                rawLastSeen = storage.d.Users[statuscall].rawLastSeen
                var ltsmsg = storage.d.Users[statuscall].lastseen
                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                var timeIdle = gettime() - rawLastSeen
                timeIdle = secondsToTime(timeIdle)
                if (timeIdle.h === 0) {
                    timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                }
                else if (timeIdle.h === 1) {
                    timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                }
                else {
                    timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                }
                messageSend(channelID, statuscall + " Is currently " + storage.d.Users[statuscall].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
            }
            else if (status === 'offline') {
                rawLastSeen = storage.d.Users[statuscall].rawLastSeen
                var ltsmsg = storage.d.Users[statuscall].lastseen
                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                var timeIdle = gettime() - rawLastSeen
                timeIdle = secondsToTime(timeIdle)
                if (timeIdle.h === 0) {
                    timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                }
                else if (timeIdle.h === 1) {
                    timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                }
                else {
                    timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                }
                messageSend(channelID, statuscall + " Is currently " + storage.d.Users[statuscall].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
            }
            else if (status === 'online') {
                messageSend(channelID, statuscall + " Is currently online")
            }
            else if (status === 'Unknown') {
                messageSend(channelID, "Oh...um, i dont know the last time " + statuscall + " was online...sorry :confounded:")
            }
        }
        else {
            var mentId = rawEvent.d.mentions[0].id
            for (var usern in storage.d.Users) {
                if (mentId === storage.d.Users[usern].id) {
                    var status = storage.d.Users[usern].status
                    if (status === 'idle') {
                        rawLastSeen = storage.d.Users[usern].rawLastSeen
                        var ltsmsg = storage.d.Users[usern].lastseen
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                        var timeIdle = gettime() - rawLastSeen
                        timeIdle = secondsToTime(timeIdle)
                        if (timeIdle.h === 0) {
                            timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        }
                        else if (timeIdle.h === 1) {
                            timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        }
                        else {
                            timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        }
                        messageSend(channelID, statuscall + " Is currently " + storage.d.Users[usern].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
                    }
                    else if (status === 'offline') {
                        rawLastSeen = storage.d.Users[usern].rawLastSeen
                        var ltsmsg = storage.d.Users[usern].lastseen
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                        var timeIdle = gettime() - rawLastSeen
                        timeIdle = secondsToTime(timeIdle)
                        if (timeIdle.h === 0) {
                            timeIdle = timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        }
                        else if (timeIdle.h === 1) {
                            timeIdle = timeIdle.h + " Hour " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        }
                        else {
                            timeIdle = timeIdle.h + " Hours " + timeIdle.m + " Minutes and " + timeIdle.s + " Seconds"
                        }
                        messageSend(channelID, statuscall + " Is currently " + storage.d.Users[usern].status + " and has been for: " + timeIdle + " And was last seen at: " + ltsmsg)
                    }
                    else if (status === 'online') {
                        messageSend(channelID, statuscall + " Is currently online")
                    }
                    else if (status === 'Unknown') {
                        messageSend(channelID, "Oh...um, i dont know the last time " + statuscall + " was online...sorry :confounded:")
                    }
                }
                else {
                    continue
                }
            }
        }
    }
    catch (e) {
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
        console.log('yes')
        lastcattime = storage.d.Servers[sname].Channels[name].lastCat
        elapsed = cattime - lastcattime
        nextTime = lastcattime + 3600
        nextTime = nextTime - cattime
        nextTime = secondsToTime(nextTime)
        elapsed = secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        catacttime = storage.d.Servers[sname].Channels[name].lastCatActt
        console.log("cat elapsed: " + JSON.stringify(elapsed))
    }
    catch (e) {
        console.log('no')
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
    }
    else {
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
        console.log('yes')
        lastsnaketime = storage.d.Servers[sname].Channels[name].lastsnake
        elapsed = snaketime - lastsnaketime
        nextTime = lastsnaketime + 3600
        nextTime = nextTime - snaketime
        nextTime = secondsToTime(nextTime)
        elapsed = secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        snakeacttime = storage.d.Servers[sname].Channels[name].lastsnakeActt
        console.log("snake elapsed: " + JSON.stringify(elapsed))
    }
    catch (e) {
        console.log('no')
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
    }
    else if (userID.indexOf('142484312862752768') !== -1) {
        request('http://fur.im/snek/snek.php', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                snakeJson = JSON.parse(body)
                messageSend(channelID, "Heres a snake for you william! " + snakeJson.file)
            }
        })
    }
    else {
        messageSend(channelID, ":no_entry: Hey hold up, only one snake per hour, last snake was posted: " + snakeacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    writeJSON('./storage', storage)
}
/*/Posts a random pug picture, limit 1 per hour/*/
function pug(channelID, name, sname) {
    var pugtime = gettime()
    if (storage.d.Servers[sname].Channels[name].lastpug === undefined) {
        storage.d.Servers[sname].Channels[name].lastpug = 0
        storage.d.Servers[sname].Channels[name].lastpugActt = 0
    }
    try {
        console.log('yes')
        lastpugtime = storage.d.Servers[sname].Channels[name].lastpug
        elapsed = pugtime - lastpugtime
        nextTime = lastpugtime + 3600
        nextTime = nextTime - pugtime
        nextTime = secondsToTime(nextTime)
        elapsed = secondsToTime(elapsed)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        pugacttime = storage.d.Servers[sname].Channels[name].lastpugActt
        console.log("pug elapsed: " + JSON.stringify(elapsed))
    }
    catch (e) {
        console.log('no')
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
    }
    else {
        messageSend(channelID, ":no_entry: Hey hold up, only one pug per hour, last pug was posted: " + pugacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    writeJSON('./storage', storage)
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
    }
    else {
        messageSend(channelID, "Not a recgonized image subreddit to see recgonized reddits type " + commandmod + "redditscenery list")
    }
    writeJSON('./storage', storage)
}
/*/Help command/*/
function help(cmd, channelID) {
    try {
        messageSend(channelID, doc.help[cmd])
    }
    catch (e) {
        messageSend(channelID, "That isn't a recgonized command, or there is no help documentation on it")
    }
}
/* Bot on event functions */
bot.on('ready', function() {
    console.log(chalk.cyan(bot.username + " - (" + bot.id + ")" + " Is now running"));
});
bot.on('debug', function(rawEvent) {
    try {
        var announceID = storage.d.Servers[bot.servers[rawEvent.d.guild_id].name].announceChan
    }
    catch (e) {
        return
    }
    //if (rawEvent.t === "MESSAGE_UPDATE") {
    //    //messageSend(rawEvent.d.channel_id, "Did you just update a message?")
    //}
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
        messageSend(announceID, "<@" + rawEvent.d.user.id + "> Just joined the server! welcome " + rawEvent.d.user.username + " to " + bot.servers[rawEvent.d.guild_id].name + "!")
    }
    if (rawEvent.t === "GUILD_MEMBER_REMOVE") {
        var name = rawEvent.d.user.username
        var userID = rawEvent.d.user.id
        messageSend(announceID, "<@" + rawEvent.d.user.id + "> Just left the server! :cold_sweat:")
    }
    if (rawEvent.t === "GUILD_CREATE") {
        var name = rawEvent.d.name
        var serverID = rawEvent.d.id
        var SownerId = rawEvent.d.owner_id
        storage.d.Servers[name] = {
            'id': serverID,
            'messageCnt': 0,
            'announceChan': null,
            'SownerId': SownerId
        }
    }
    if (rawEvent.t === "CHANNEL_CREATE") {
        var name = rawEvent.d.name
        var channelID = rawEvent.d.id
        var type = rawEvent.d.type
        var sname = rawEvent.d.guild_id
        storage.d.Servers[sname].Channels[name] = {
            "id": channelID,
            "type": type,
            "messageCnt": 0,
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
        var verb = storage.d.Servers[sname].Verb
    }
    catch (e) {
        verb = false
        storage.d.Servers[sname].Verb = false
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
                var lastseen = moment().format('MMMM Do YYYY, HH:mm:ss')
                storage.d.Users[user].lastseen = lastseen
                storage.d.Users[user].rawLastSeen = gettime()
                if (storage.d.Users[user].status !== 'offline' && verb) {
                    logger.info(chalk.dim(lastseen + ' : ' + chalk.red(user + " is now: " + chalk.underline(status))));
                }
                storage.d.Users[user].status = status
            }
            else if (user === undefined) {
                var lastseen = moment().format('MMMM Do YYYY, HH:mm:ss')
                storage.d.Users[user].rawLastSeen = gettime()
                for (var user in storage.d.Users) {
                    if (userID === storage.d.Users[user].id) {
                        storage.d.Users[user].lastseen = lastseen
                        storage.d.Users[user].rawLastSeen = gettime()
                        if (storage.d.Users[user].status !== 'offline' && verb) {
                            logger.info(chalk.dim(lastseen + ' : ' + chalk.red(user + " is now: " + chalk.underline(status))));
                        }
                        storage.d.Users[user].status = status
                    }
                    else {
                        continue
                    }
                }
            }
        }
        if (status === 'idle') {
            var lastseen = moment().format('MMMM Do YYYY, HH:mm:ss')
            storage.d.Users[user].lastseen = lastseen
            storage.d.Users[user].rawLastSeen = gettime()
            if (storage.d.Users[user].status !== 'idle' && verb) {
                logger.info(chalk.dim(lastseen + ' : ' + chalk.yellow(user + " is now: " + chalk.underline(status))));
            }
            storage.d.Users[user].status = status
        }
        if (status === 'online') {
            var lastseen = moment().format('MMMM Do YYYY, HH:mm:ss')
            if (storage.d.Users[user].status !== 'online' && verb) {
                logger.info(chalk.dim(lastseen + ' : ' + chalk.green(user + " is now: " + chalk.underline(status))));
            }
            storage.d.Users[user].status = status
        }
    }
    catch (e) {
        return
    }

    writeJSON('./storage', storage)
});
bot.on('message', function(user, userID, channelID, message, rawEvent) {
    if (storage.settings.ignoredChannels.indexOf(channelID) !== -1) {
        var ignore = true
    }
    rconcmd = 'No'
    if (channelID in bot.directMessages) {
        DM = true
    }
    else {
        DM = false
    }
    //Gets the message id and server id
    var messageID = rawEvent.d.id
    var serverID = bot.serverFromChannel(channelID)
        //gets the server and channel name
    try {
        var cname = bot.servers[serverID].channels[channelID].name
        var sname = bot.servers[serverID].name
    }
    catch (e) {
        e = e
    }
    try {
        if (storage.d.Servers[sname] === undefined) {
            storage.d.Servers[sname] = {
                'id': serverID,
                'messageCnt': 0,
                'announceChan': null,
                'SownerId': SownerId,
                'Channels': {}
            }
            for (var channelID in bot.servers[serverID].channels) {
                var name = bot.servers[serverID].channels[channelID].name;
                var type = bot.servers[serverID].channels[channelID].type;
                var sname = bot.servers[serverID].name
                storage.d.Servers[sname].Channels[name] = {
                    "id": channelID,
                    "type": type,
                    "messageCnt": 0,
                }
            }
        }

    }
    catch (e) {
        e = e
    }

    try {
        if (storage.d.Servers[sname].SownerId !== undefined) {
            var SownerId = storage.d.Servers[sname].SownerId
        }
    }
    catch (e) {
        error = true
    }
    try {
        var verb = storage.d.Servers[sname].Verb
    }
    catch (e) {
        verb = false
        storage.d.Servers[sname].Verb = false
    }
    //Logging Related
    if (storage.d.Users[user] !== undefined) {
        if (storage.d.Users[user].messageCnt === undefined) {
            storage.d.Users[user].messageCnt = 1
        }
        else {
            mucount = storage.d.Users[user].messageCnt
            mucount = mucount + 1
            storage.d.Users[user].messageCnt = mucount
        }
        writeJSON('./storage', storage)
    }
    if (message.toLowerCase().indexOf('http') !== -1) {
        logger.info(chalk.dim("Link Posted, logging to file"))
        if (message.indexOf(' ', message.indexOf('http')) === -1) {
            var link = message.substring(message.indexOf('http'))
        }
        else if (message.indexOf(' ', message.indexOf('http')) !== -1) {
            var link = message.substring(message.indexOf('http'), message.indexOf(' ', message.indexOf('http')))
        }
        if (storage.d.Users[user] !== undefined) {
            if (storage.d.Users[user].linkCnt === undefined) {
                storage.d.Users[user].linkCnt = 1
            }
            else {
                lucount = storage.d.Users[user].linkCnt
                lucount = lucount + 1
                storage.d.Users[user].linkCnt = lucount
            }
            writeJSON('./storage', storage)
        }
        fs.appendFile("logs/Links.txt", '\n' + link)
    }
    if (cname !== undefined) {
        if (storage.d.Servers[sname].Channels[cname].messageCnt === undefined) {
            storage.d.Servers[sname].Channels[cname].messageCnt = 1
        }
        else {
            mccount = storage.d.Servers[sname].Channels[cname].messageCnt
            mccount = mccount + 1
            storage.d.Servers[sname].Channels[cname].messageCnt = mccount
        }
        writeJSON('./storage', storage)
    }
    if (sname !== undefined) {
        if (storage.d.Servers[sname].messageCnt === undefined) {
            storage.d.Servers[sname].messageCnt = 1
        }
        else {
            mscount = storage.d.Servers[sname].messageCnt
            mscount = mscount + 1
            storage.d.Servers[sname].messageCnt = mscount
        }
        writeJSON('./storage', storage)
    }
    //debug!
    if (debug === 1) {
        console.log(rawEvent)
    }
    try {
        if (storage.d.Servers[sname].prefixOvrid !== undefined) {
            commandmod = storage.d.Servers[sname].prefixOvrid
        }
        else {
            commandmod = '!'
        }
    }
    catch (e) {
        e = e
    }
    //function to quick call message sending to minimize code
    function messgnt(msg) {
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
    }
    catch (e) {
        var error = null
    }
    //This tests for commands using the command mod set in the config
    if (message.indexOf(commandmod) !== -1) {
        if (message.toLowerCase().indexOf('ping') === 1 && ignore !== true) {
            messageSend(channelID, 'pong')
        }
        if (message.toLowerCase().indexOf('help') === 1 && ignore !== true) {
            if (message.indexOf(' ') === -1) {
                help('help', channelID)
            }
            else {
                helpcall = message.substring(message.indexOf(' ') + 1)
                help(helpcall, channelID)
            }
        }
        if (message.toLowerCase().indexOf('info') === 1 && ignore !== true) {
            messageSend(userID, doc.info)
        }
        //This is the command for rolling dice
        if (message.toLowerCase().indexOf('roll') === 1 && ignore !== true) {
            var msg = message
            var dice = msg.replace(commandmod + 'roll ', '')
            diceroll(dice, userID, channelID)
            rconcmd = 'Yes'
        }
        //Makes scratch print out her avatar
        if (message.indexOf("avatar") === 1 && ignore !== true) {
            bot.uploadFile({
                to: channelID,
                file: "./assets/avatar.png",
                filename: "avatar.png",
                message: "Here you go!",
                typing: true
            });
            rconcmd = 'Yes'
        }
        //Makes scratch print out channel id's and user id's
        if (message.toLowerCase().indexOf('ids') === 1 && ignore !== true) {
            bot.sendMessage({
                to: channelID,
                message: '<@' + userID + '>' + ' Your userID is: ' + userID + ' and your channelID is: ' + channelID,
                typing: false
            });
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('math') === 1 && ignore !== true) {
            var mathcmd = message
            var mathcall = mathcmd.replace(commandmod + 'math ', '')
            try {
                messgnt('<@' + userID + '>' + " the answer is this: " + math.eval(mathcall))
            }
            catch (e) {
                logger.error("Bad Math Command " + mathcall + " | " + e)
                messgnt("Sorry I'm unable to run that")
            }
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('status') === 1 && ignore !== true) {
            var statuscmd = message
            var statuscall = statuscmd.replace(commandmod + 'status ', '')
            status(statuscall, channelID, rawEvent)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('commands') === 1 && ignore !== true) {
            cList = "help, "
            messageSend(channelID, "Check your PM's :mailbox_with_mail:")
            for (var i = 0; i < doc.cList.length; i++) {
                if (i < doc.cList.length - 1) {
                    cList = cList + doc.cList[i] + ", "
                }
                else {
                    cList = cList + doc.cList[i]
                }
            }
            messageSend(userID, "Here are my commands!: \n\n```" + cList + '```\n')
            messageDelete(channelID, messageID)
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('poke') === 1 && ignore !== true) {
            var pkcmd = message
            var pkcall = pkcmd.replace(commandmod + 'poke ', '')
            var pkcall = pkcall.replace('<@', '')
            var pkcall = pkcall.replace('>', '')
            messageSend(pkcall, "Hi <@" + pkcall + "> You where poked by: <@" + userID + "> in: <#" + channelID + ">")
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('stats') === 1 && ignore !== true) {
            var len = message.length
            if (len === 6) {
                try {
                    messageSend(channelID, "Your current stats are: \n" + "Messages Sent: " + storage.d.Users[user].messageCnt + "\nLinks Sent: " + storage.d.Users[user].linkCnt)
                }
                catch (e) {
                    messageSend(channelID, 'Um...There was a error doing that, probally because you havent sent any links yet')
                }
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('ignore') === 1) {
            var igcmd = message
            var igcall = igcmd.replace(commandmod + 'ignore ', '')
            if (userID.indexOf(ownerId) === 0) {
                if (igcall.toLowerCase().indexOf('remove') !== -1 && userID.indexOf(ownerId) === 0) {
                    uningoreC(channelID)
                    messageSend(channelID, 'Ok no longer ignoring this channel')
                }
                else {
                    ignoreC(channelID)
                    messageSend(channelID, 'Ok ignoring this channel')
                }
            }
            else if (userID.indexOf(SownerId) === 0) {
                if (igcall.toLowerCase().indexOf('remove') !== -1 && userID.indexOf(SownerId) === 0) {
                    uningoreC(channelID)
                    messageSend(channelID, 'Ok no longer ignoring this channel')
                }
                else {
                    ignoreC(channelID)
                    messageSend(channelID, 'Ok ignoring this channel')
                }
            }
            else {
                messageSend(channelID, "You are not allowed to do that command, you need to be either the bot or server owner")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('prefix') === 1) {
            var pfcmd = message
            var pfcall = pfcmd.replace(commandmod + 'prefix ', '')
            if (userID.indexOf(ownerId) === 0) {
                storage.d.Servers[sname].prefixOvrid = pfcall
            }
            else if (userID.indexOf(SownerId) === 0) {
                storage.d.Servers[sname].prefixOvrid = pfcall
            }
            else {
                messageSend(channelID, "You are not allowed to do that command, you need to be either the bot or server owner")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('yt') === 1 && ignore !== true) {
            var ytcmd = message
            var ytcall = ytcmd.replace(commandmod + 'yt ', '')
            yt(ytcall, userID, channelID)
            bot.deleteMessage({
                channel: channelID,
                messageID: messageID
            });
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('xkcd') === 1 && ignore !== true) {
            if (message.indexOf(' ') === -1) {
                var comictime = gettime()
                try {
                    lastcomictime = storage.d.Servers[sname].Channels[cname].lastComic
                    elapsed = comictime - lastcomictime
                    elapsed = secondsToTime(elapsed)
                    comicacttime = storage.d.Servers[sname].Channels[cname].lastComicActt
                    console.log("Comic elapsed: " + JSON.stringify(elapsed))
                }
                catch (e) {
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
                }
                else {
                    messageSend(channelID, ":no_entry: Hey hold up, only one comic per hour, last comic was posted: " + comicacttime)
                }
            }
            else {
                var xkcdcmd = message
                var xkcdcall = xkcdcmd.replace(commandmod + 'xkcd ', '')
                relxkcd(xkcdcall, channelID, cname, sname)
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('skip') === 1 && ignore !== true) {
            bot.deleteMessage({
                channel: channelID,
                messageID: messageID
            })
        }
        if (message.toLowerCase().indexOf('announce') === 1 && ignore !== true) {
            if (userID.indexOf(ownerId) === 0) {
                if (storage.d.Servers[sname].announceChan === null || storage.d.Servers[sname].announceChan === undefined) {
                    try {
                        storage.d.Servers[sname].announceChan = channelID
                        messageSend(channelID, "Ok now announcing user changes on this channel")
                    }
                    catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
                else {
                    try {
                        storage.d.Servers[sname].announceChan = null
                        messageSend(channelID, "Ok no longer announcing user changes on this channel")
                    }
                    catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
            }
            else if (userID.indexOf(SownerId) === 0) {
                if (storage.d.Servers[sname].announceChan === null || storage.d.Servers[sname].announceChan === undefined) {
                    try {
                        storage.d.Servers[sname].announceChan = channelID
                        messageSend(channelID, "Ok now announcing user changes on this channel")
                    }
                    catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
                else {
                    try {
                        storage.d.Servers[sname].announceChan = null
                        messageSend(channelID, "Ok no longer announcing user changes on this channel")
                    }
                    catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
            }
            else {
                messageSend(channelID, "You are not allowed to do that command, you need to be eithe the bot or server owner")
            }
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('cat') === 1 && ignore !== true) {
            cat(channelID, cname, sname)
        }
        if (message.toLowerCase().indexOf('snake') === 1 && ignore !== true) {
            snake(channelID, cname, sname, userID)
        }
        if (message.toLowerCase().indexOf('pug') === 1 && ignore !== true) {
            pug(channelID, cname, sname)
        }
        if (message.toLowerCase().indexOf('redditscenery') === 1 && ignore !== true) {
            var random = redditList[Math.floor(Math.random() * redditList.length)]
            var redditcmd = message
            var redditcall = redditcmd.replace(commandmod + 'redditscenery ', '')
            if (redditcall.toLowerCase().indexOf('add') !== -1 && userID.indexOf(ownerId) === 0) {
                var redditcall = redditcmd.replace('add  ', '')
                storage.settings.redditList.push(redditcall)
            }
            else if (redditcall.toLowerCase().indexOf('list') !== -1) {
                redditNList = ""
                for (var i = 0; i < redditList.length; i++) {
                    if (i < redditList.length - 1) {
                        redditNList = redditNList + redditList[i] + ", "
                    }
                    else {
                        redditNList = redditNList + redditList[i]
                    }
                }
                messageSend(channelID, "Check your PM's :mailbox_with_mail:")
                messageSend(userID, "Here are my tracked subreddits!: \n\n```" + redditNList + '```\n')
            }
            else if (redditcmd.indexOf(' ') !== -1) {
                redditScenery(channelID, redditcall.toLowerCase())
            }
            else {
                messgnt("Ok heres a " + random + " related picture")
                console.log('Random')
                redditScenery(channelID, random)
            }
        }
        //Makes scratch execute jvascript, warning this command is really powerful and is limited to owner access only
        if (message.toLowerCase().indexOf('verb') === 1) {
            if (userID.indexOf(ownerId) === 0) {
                if (storage.d.Servers[sname].Verb === false || storage.d.Servers[sname].Verb === undefined) {
                    try {
                        storage.d.Servers[sname].Verb = true
                        messageSend(channelID, "Ok now logging messages and status changes from this server into console")
                    }
                    catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
                else {
                    try {
                        storage.d.Servers[sname].Verb = false
                        messageSend(channelID, "Ok no longer logging messages and status changes from this server into console")
                    }
                    catch (e) {
                        logger.error(chalk.red(e))
                    }
                }
            }
            else {
                messgnt('<@' + userID + "> You are not allowed to use this command, only <@" + ownerId + "> can because it can damage the bot")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('js') === 1) {
            if (userID.indexOf(ownerId) === 0) {
                try {
                    eval(jscall)
                }
                catch (e) {
                    logger.error(chalk.red("Bad JS Command " + e))
                    messgnt("Err...I'm sorry...that results in a error")
                }
            }
            else {
                messgnt('<@' + userID + "> You are not allowed to use this command, only <@" + ownerId + "> can because it can damage the bot")
            }
            rconcmd = 'Yes'
        }
        else if (rconcmd === 'no') {
            logger.info(commandmod + ' was said but there was No Detected command');
        }
    }
    if (channelID === '164845697508704257') {
        console.log(chalk.dim(message))
        fs.appendFile("logs/space.txt", '\n\n' + message)
        story.space(message, {
            mID: messageID,
            username: user
        })
    }
    if (channelID === '167855344129802241') {
        console.log(chalk.dim(message))
        fs.appendFile("logs/unknown.txt", '\n\n' + message)
        story.unknown(message, {
            mID: messageID,
            username: user
        })
    }
    if (channelID === '177624925794861056') {
        console.log(chalk.dim(message))
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
        }
        else if (channelID.indexOf('164845697508704257') === 0) {
            return
        }
        else if (channelID.indexOf('167855344129802241')) {
            return
        }
    }
    else if (rconcmd === "No" && ignore !== true) {
        var timed = Date()
        timed = '[' + timed.replace(' GMT-0500 (CDT)', '') + '] '
        timed = timed.replace('GMT-0500 (Central Daylight Time)', '')
        if (channelID in bot.directMessages) {
            console.log(timed + 'Channel: ' + 'DM | ' + user + ': ' + message)
            fs.appendFile("logs/DMs" + user + ".txt", '\n' + timed + user + ": " + message)
        }
        else {
            servern = bot.servers[serverID].name
            channeln = bot.servers[serverID].channels[channelID].name
            mkdirp('./logs/' + servern, function(err) {
                fs.appendFile("./logs/" + servern + '/' + channeln + '.txt', '\n' + timed + user + ": " + message)
            })
            if (verb || cnaid === channelID) {
                console.log(timed + 'Channel: ' + servern + '/' + channeln + ' | ' + user + ': ' + message)
            }
        }
    }
    else if (userID.indexOf('104867073343127552') != 0 || channelID.indexOf('164845697508704257') != 0 && rconcmd === "Yes" && ignore !== true) {
        if (ignore !== true) {
            logger.info(chalk.dim('Last Message User: ' + user + ' | IDs: ' + ' ' + userID + '/' + channelID + ' | Reconized command?: ' + rconcmd + ' | Message: ' + message));
        }
    }
    ignore = null
    announce = null
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