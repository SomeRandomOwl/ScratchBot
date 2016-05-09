function search(quer, channelID, name, sname) {
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
                        messageSend(channelID, xkcdJson.title + '\n ```' + xkcdJson.alt + '```\n' + xkcdJson.img)
                        return elapsed
                    }
                })
            }
        })
        var lastcomictime = gettime()
        storage.d.Servers[sname].Channels[name].lastComic = lastcomictime
    } else {
        messageSend(channelID, ":no_entry: Hey hold up, only one comic per hour, last comic was posted: " + comicacttime + ", time untill next post is allowed: " + nextTime)
        return elapsed
    }
    //writeJSON('./storage', storage)
}
export search