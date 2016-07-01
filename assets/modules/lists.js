var cmds = require('./')
var chalk = require('chalk')
var moment = require('moment')
var winston = require('winston');

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

/*/Lists currently connected severs and writes them to json/*/
exports.server = function(bot, storage, verb, s) {
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
    cmds.util.writeJSON('./assets/storage', storage)
}
/*/Lists currencly seen channels/*/
exports.channel = function(bot, storage, verb, s) {
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
    cmds.util.writeJSON('./assets/storage', storage)
}
/*/List currently seen users/*/
exports.user = function(bot, storage, verb, s) {
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
                    "lastChat": moment().format('MMMM Do YYYY, hh:mm:ss a'),
                    "lastChatR": cmds.util.gettime(),
                    "rawLastSeen": 0,
                    "totalIdle": {
                        'd': 0,
                        'h': 0,
                        'm': 0,
                        's': 0
                    },
                    "totalOffline": {
                        'd': 0,
                        'h': 0,
                        'm': 0,
                        's': 0
                    },
                    "Servers": [],
                    "tracking": moment().format('MMMM Do YYYY, hh:mm:ss a')
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
                if (storage.d.Users[name].lastChat === undefined) {
                    storage.d.Users[name].lastChat = moment().format('MMMM Do YYYY, hh:mm:ss a')
                }
                if (storage.d.Users[name].lastChatR === undefined) {
                    storage.d.Users[name].lastChatR = cmds.util.gettime()
                }
                if (storage.d.Users[name].Servers === undefined) {
                    storage.d.Users[name].Servers = []
                }

                if (cmds.util.isInArray(bot.servers[serverID].name, storage.d.Users[name].Servers)) {
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
    cmds.util.writeJSON('./assets/storage', storage)
}