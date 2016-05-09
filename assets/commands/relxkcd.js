var storage = require('../storage.json')
var DiscordClient = require('../../node_modules/discord.io')
var exports = module.exports = {}

function messageSend(channelID, msg, bot) {
    bot.sendMessage({
        to: channelID,
        message: msg,
        typing: false
    }, function(error, response) {
        try {
            logger.info(chalk.dim('Last Message Sent ID: ' + response.id))
            sentPrevId = response.id
        } catch (e) {
            return
        }
    });
    return sentPrevId
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

exports.search = function(quer, channelID, name, sname, bot) {
    var comictime = gettime()
    try {
        lastcomictime = storage.d.Servers[sname].Channels[name].lastComic
        elapsed = comictime - lastcomictime
        elapsed = secondsToTime(elapsed)
        comicacttime = storage.d.Servers[sname].Channels[name].lastComicActt
        nextTime = lastcattime + 3600
        nextTime = nextTime - cattime
        nextTime = secondsToTime(nextTime)
        nextTime = nextTime.m + " Minutes and " + nextTime.s + " Seconds"
        console.log("Comic elapsed: " + JSON.stringify(elapsed))
    } catch (e) {
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
                        messageSend(channelID, xkcdJson.title + '\n ```' + xkcdJson.alt + '```\n' + xkcdJson.img, bot)
                        return xkcdJson.title + '\n ```' + xkcdJson.alt + '```\n' + xkcdJson.img
                    }
                })
            }
        })
        var lastcomictime = gettime()
        storage.d.Servers[sname].Channels[name].lastComic = lastcomictime
    } else {
        messageSend(channelID, ":no_entry: Hey hold up, only one comic per hour, last comic was posted: " + comicacttime + ", time untill next post is allowed: " + nextTime, botbo)
        return ":no_entry: Hey hold up, only one comic per hour, last comic was posted: " + comicacttime + ", time untill next post is allowed: " + nextTime
    }
    //writeJSON('./storage', storage)
}