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
var imgur = require('imgur-node-api');
var moment = require('moment');
/*/Loads Storage.json if it exists/*/
if (fs.existsSync('storage.json')) {
    console.log('Found Storage.json');
    var storage = require('./storage.json')
} else if (fs.existsSync('storage.json') === false) {
    console.log('Didnt Find Storage.json, Please run generateStorageFile.js')
}
youTube.setKey(config.youTubeApiKey);
var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            filename: 'logs/Command.log'
        })
    ]
});
/*/Bot credentials/*/
var bot = new DiscordClient({
    autorun: true,
    //email: config.email,
    //password: config.pass,
    token: config.token
});
/*/Start up console output/*/
bot.on('ready', function() {
    logger.info(bot.username + " - (" + bot.id + ")" + " Is now running");
});
/*/Global variable setting/*/
var cnaid = '162390519748624384'
var dateFormat = 'MMMM Do YYYY, h:mm:ss a'
var lastseen = null
var logChan = config.logChan;
var sentPrevId = null;
var commandmod = config.cmdMod;
var ownerId = config.ownerId;
var rconcmd = 'No';
var clist = '\nUtility: !commands, !math, !ids, !supportedmath, !yt, !triggers\nOther: !picture';
var tlist = '\nUtility: ping\nPolite replies: goodnight,  nite,  night, hi, hello';
var nighttig = ['night', 'nite', 'goodnight', "g'nite", 'nighty nite!'];
var debug = false;
var serverID = null;
var clistl = clist.length
    //Writes JSON to a file

/* Start of function defining */

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
/*/Lists currently connected severs and writes them to json/*/
function serverlist(verb) {
    if (verb) {
        console.log("Currently connected to these servers: ")
    }
    for (var serverID in bot.servers) {
        if (verb) {
            console.log(bot.servers[serverID].name)
        }
        var name = bot.servers[serverID].name;
        if (storage.d.Servers[name] === undefined) {
            storage.d.Servers[name] = {
                'id': serverID
            }
        } else {
            if (storage.d.Servers[name].messageCnt === undefined) {
                storage.d.Servers[name].messageCnt = 0
            }
        }
    }
    writeJSON('./storage', storage)
}
/*/Lists currencly seen channels/*/
function channellist(verb) {
    if (verb) {
        console.log("Currently connected to these channels: ")
    }
    for (var serverID in bot.servers) {
        for (var channelID in bot.servers[serverID].channels) {
            if (verb) {
                console.log(bot.servers[serverID].channels[channelID].name)
            }
            var name = bot.servers[serverID].channels[channelID].name;
            var type = bot.servers[serverID].channels[channelID].type;
            if (storage.d.Channels[name] === undefined) {
                storage.d.Channels[name] = {
                    "id": channelID,
                    "type": type
                }
            } else {
                storage.d.Channels[name].id = channelID
                storage.d.Channels[name].type = type
                if (storage.d.Channels[name].messageCnt === undefined) {
                    storage.d.Channels[name].messageCnt = 0
                }
            }
        }
    }
    writeJSON('./storage', storage)
}
/*/List currently/*/
function userlist(verb) {
    if (verb) {
        console.log("Currently seeing these users: ")
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
                    "linkCnt": 0
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
        console.log('Last Message Sent ID: ' + response.id)
        sentPrevId = response.id
    });
}
/*/Console related input functions/*/
function consoleparse(line) {
    if (line.toLowerCase().indexOf('~') === 0) {
        if (line.toLowerCase().indexOf('cnaid') === 1) {
            cnaid = line.replace('~cnaid ', '')
            console.log("Now talking in channel: " + cnaid)
        } else if (line.toLowerCase().indexOf('cnch') === 1) {
            var cnch = line.substring(line.indexOf(' ') + 1)
            for (var channel in storage.d.Channels) {
                if (cnch === channel) {
                    cnaid = storage.d.Channels[channel].id
                    continue
                } else {
                    continue
                }
            }
        } else {
            eval(line)
        }
    } else if (line.toLowerCase().indexOf('~') !== 0) {
        bot.sendMessage({
            to: cnaid,
            message: line,
            typeing: true
        })
    }
}

/* Bot on event functions */
bot.on('disconnected', function() {
    logger.error("Bot got disconnected, reconnecting")
    bot.connect()
    logger.info("Reconnected")
});
bot.on("presence", function(user, userID, status, gameName, rawEvent) {
    if (status === 'offline') {
        var lastseen = moment().format('MMMM Do YYYY, HH:mm:ss')
        storage.d.Users[user].lastseen = lastseen
        if (storage.d.Users[user].status !== 'offline') {
            logger.info(lastseen + ' : ' + user + " is now: " + status);
        }
        storage.d.Users[user].status = status
    }
    if (status === 'idle') {
        var lastseen = moment().format('MMMM Do YYYY, HH:mm:ss')
        storage.d.Users[user].lastseen = lastseen
        if (storage.d.Users[user].status !== 'idle') {
            logger.info(lastseen + ' : ' + user + " is now: " + status);
        }
        storage.d.Users[user].status = status
    }
    if (status === 'online') {
        var lastseen = moment().format('MMMM Do YYYY, HH:mm:ss')
        if (storage.d.Users[user].status !== 'online') {
            logger.info(lastseen + ' : ' + user + " is now: " + status);
        }
        storage.d.Users[user].status = status
    }
    writeJSON('./storage', storage)
    //bot.sendMessage({
    //   to: logChan,
    //   message: user + " is now: " + status,
    //   typing: false
    //});
});
bot.on('message', function(user, userID, channelID, message, rawEvent) {
    if (storage.settings.ignoredChannels.indexOf(channelID) !== -1) {
        var ignore = true
    }
    rconcmd = 'No'

    //Gets the message id and server id
    var messageID = rawEvent.d.id
    var serverID = bot.serverFromChannel(channelID)
        //gets the server and channel name
    try {
        var cname = bot.servers[serverID].channels[channelID].name
        var sname = bot.servers[serverID].name
    } catch (e) {
        console.log(e)
    }
    //Logging Related
    if (storage.d.Users[user] !== undefined) {
        if (storage.d.Users[user].messageCnt === undefined) {
            storage.d.Users[user].messageCnt = 1
        } else {
            mucount = storage.d.Users[user].messageCnt
            mucount = mucount + 1
            storage.d.Users[user].messageCnt = mucount
        }
        writeJSON('./storage', storage)
    }
    if (message.toLowerCase().indexOf('http') !== -1) {
        console.log("Link Posted, logging to file")
        if (message.indexOf(' ', message.indexOf('http')) === -1) {
            var link = message.substring(message.indexOf('http'))
        } else if (message.indexOf(' ', message.indexOf('http')) !== -1) {
            var link = message.substring(message.indexOf('http'), message.indexOf(' ', message.indexOf('http')))
        }
        if (storage.d.Users[user] !== undefined) {
            if (storage.d.Users[user].linkCnt === undefined) {
                storage.d.Users[user].linkCnt = 1
            } else {
                lucount = storage.d.Users[user].linkCnt
                lucount = lucount + 1
                storage.d.Users[user].linkCnt = lucount
            }
            writeJSON('./storage', storage)
        }
        fs.appendFile("logs/Links.txt", '\n' + link)
    }
    if (cname !== undefined) {
        if (storage.d.Channels[cname].messageCnt === undefined) {
            storage.d.Channels[cname].messageCnt = 1
        } else {
            mccount = storage.d.Channels[cname].messageCnt
            mccount = mccount + 1
            storage.d.Channels[cname].messageCnt = mccount
        }
        writeJSON('./storage', storage)
    }
    if (sname !== undefined) {
        if (storage.d.Servers[sname].messageCnt === undefined) {
            storage.d.Servers[sname].messageCnt = 1
        } else {
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
    //function to quick call message sending to minimize code
    function messgnt(msg) {
        bot.sendMessage({
            to: channelID,
            message: msg,
            typing: false
        });
    }
    //Test Connectivity
    if (message.toLowerCase() === "ping" && ignore !== true) {
        messgnt("pong")
        rconcmd = 'Yes'
    }
    if (message.toLowerCase() === "rick" && userID != '167017777012408320' && user != 'ScratchBot' && ignore !== true) {
        var ricks = ["and morty!", "dont forget morty!", "uuuuur morty! er goota git outta here morty! They're onto us!", "Wubba-Lubba Dub Dub!"]
        var rickm = "Morty!"
        rickm = ricks[Math.floor(Math.random() * ricks.length)];
        messgnt(rickm)
        rconcmd = 'Yes'
    }
    if (message.toLowerCase() === "thanks scratch" && ignore !== true) {
        messgnt("You're Welcome!")
        rconcmd = 'Yes'
    }
    if (message.toLowerCase() === "say hello scratch" && ignore !== true) {
        messgnt("Hello World")
        rconcmd = 'Yes'
    }
    if (message.toLowerCase() === "hey nice avatar scratch" || message.toLowerCase() === "nice avatar scratch" && ignore !== true) {
        bot.uploadFile({
            to: channelID,
            file: "avatar.png",
            filename: "avatar.png",
            message: "Thanks! Heres a bigger version!",
            typing: true
        });
        rconcmd = 'Yes'
    }
    if (isInArray(message, nighttig) && ignore !== true) {
        var nights = ["Night! :zzz:", "Goodnight <@" + userID + "> :zzz:", "Sleep well <@" + userID + "> :zzz:", "Have a good sleep! :zzz:", "Don't let the bed bugs bite! :zzz:", "Nighty nite! :zzz:"]
        var nightm = "Night!"
        nightm = nights[Math.floor(Math.random() * nights.length)];
        bot.sendMessage({
            to: channelID,
            message: nightm,
            typing: true
        });
        rconcmd = 'Yes'
    }
    //This tests for commands using the command mod set in the config
    if (message.indexOf(commandmod) != -1) {
        //This is the command for rolling dice
        if (message.toLowerCase().indexOf('roll') === 1 && ignore !== true) {
            //This pulls the entire message into a seperate variable
            var msg = message
                //This removes the !roll
            var dice = msg.replace('!roll ', '')
                //this retrieves what kind of die it is currently unused, but will be implimented to limit it to a d100
            var typedie = dice.substring(dice.toLowerCase().indexOf('d') + 1)
            if (dice.indexOf('d') === 0) {
                var dienum = roll.roll(dice);
                console.log(dienum);
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '>' + ' rolled: ' + dienum.rolled.toString(),
                    typing: false
                });
            }
            //This is if theres more than one die thrown
            if (dice.indexOf('d') !== 0 && dice.indexOf('d') != -1) {
                var numdie = dice.substring(0, dice.toLowerCase().indexOf('d'))
                    //This is to limit the number of die thrown
                if (numdie < 21) {
                    var dienum = roll.roll(dice);
                    console.log(dienum);
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '>' + ' rolled: ' + dienum.rolled.toString() + ' For a total of: ' + dienum.result,
                        typing: false
                    });
                } else if (numdie > 21) {
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '>' + ' Please roll no more than 20 dice',
                        typing: false
                    });
                }
            }
            //If now die are thrown toss this
            if (dice.indexOf('d') === -1) {
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '>' + ' How can i roll a die with no dice to roll? :disappointed:',
                    typing: false
                });
            }
            rconcmd = 'Yes'
        }
        //Makes scratch print out her avatar
        if (message.indexOf("avatar") === 1 && ignore !== true) {
            bot.uploadFile({
                to: channelID,
                file: "avatar.png",
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
            var mathcall = mathcmd.replace('!math ', '')
            try {
                messgnt('<@' + userID + '>' + " the answer is this: " + math.eval(mathcall))
            } catch (e) {
                logger.error("Bad Math Command " + mathcall + " | " + e)
                messgnt("Sorry I'm unable to run that")
            }
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('status') === 1 && ignore !== true) {
            var statuscmd = message
            var statuscall = statuscmd.replace('!status ', '')
            console.log(statuscall)
            try {
                if (statuscall.toLowerCase().indexOf('<@') === -1) {
                    var status = storage.d.Users[statuscall].status
                    if (status === 'idle') {
                        var ltsmsg = storage.d.Users[statuscall].lastseen
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                        messageSend(channelID, statuscall + " Is currently " + storage.d.Users[statuscall].status + " And was last Seen: " + ltsmsg)
                    } else if (status === 'offline') {
                        var ltsmsg = storage.d.Users[statuscall].lastseen
                        ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                        messageSend(channelID, statuscall + " Is currently " + storage.d.Users[statuscall].status + " And was last Seen: " + ltsmsg)
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
                                var ltsmsg = storage.d.Users[usern].lastseen
                                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                                messageSend(channelID, statuscall + " Is currently " + storage.d.Users[usern].status + " And was last Seen: " + ltsmsg)
                            } else if (status === 'offline') {
                                var ltsmsg = storage.d.Users[usern].lastseen
                                ltsmsg = moment(ltsmsg, ['MMMM Do YYYY, HH:mm:ss']).format('MMMM Do YYYY, h:mm:ss a')
                                messageSend(channelID, statuscall + " Is currently " + storage.d.Users[usern].status + " And was last Seen: " + ltsmsg)
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
                messageSend(channelID, "Error; No User specified, or invalid user")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('supportedmath') === 1 && ignore !== true) {
            bot.uploadFile({
                to: channelID,
                file: "math.png",
                filename: "math.png",
                message: "This is a picture of what shouldent crash me currently",
                typing: false
            });
            rconcmd = "Yes"
        }
        if (message.toLowerCase().indexOf('triggers') === 1 && ignore !== true) {
            messgnt("Check your PM's :mailbox_with_mail:")
            bot.sendMessage({
                to: userID,
                message: "Here are my triggers!: \n\n```" + tlist + '```\n',
                typing: false
            });
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('commands') === 1 && ignore !== true) {
            messgnt("Check your PM's :mailbox_with_mail:")
            bot.sendMessage({
                to: userID,
                message: "Here are my commands!: \n\n```" + clist + '```\n',
                typing: false
            });
            bot.deleteMessage({
                channel: channelID,
                messageID: messageID
            })
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('poke') === 1 && ignore !== true) {
            var pkcmd = message
            var pkcall = pkcmd.replace('!poke ', '')
            var pkcall = pkcall.replace('<@', '')
            var pkcall = pkcall.replace('>', '')
            bot.sendMessage({
                to: pkcall,
                message: "Hi <@" + pkcall + "> You where poked by: <@" + userID + "> in: <#" + channelID + ">",
                typing: false
            })
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('stats') === 1 && ignore !== true) {
            var len = message.length
            if (len === 6) {
                try {
                    messageSend(channelID, "Your current stats are: \n" + "Messages Sent: " + storage.d.Users[user].messageCnt + "\nLinks Sent: " + storage.d.Users[user].linkCnt)
                } catch (e) {
                    messageSend(channelID, 'Um...There was a error doing that, probally because you havent sent any links yet')
                }
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('ignore') === 1 && userID.indexOf(ownerId) === 0) {
            var igcmd = message
            var igcall = igcmd.replace('!ignore ', '')
            if (igcall.toLowerCase().indexOf('remove') !== -1 && userID.indexOf(ownerId) === 0) {
                uningoreC(channelID)
                messageSend(channelID, 'Ok no longer ignoring this channel')
            } else {
                ignoreC(channelID)
                messageSend(channelID, 'Ok ignoring this channel')
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('yt') === 1 && ignore !== true) {
            var ytcmd = message
            var ytcall = ytcmd.replace('!yt ', '')
            youTube.search(ytcall, 1, function(error, result) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(result.items[0])
                    try {
                        if (result.items[0].id.kind === 'youtube#video') {
                            var description = result.items[0].snippet.description
                            while (description.indexOf('http') !== -1) {
                                description = description.replace('http://', '')
                                description = description.replace('https://', '')
                            }

                            messgnt('<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\n\nDescription: ' + description + '\nhttps://youtu.be/' + result.items[0].id.videoId)
                        } else if (result.items[0].id.kind === 'youtube#channel') {
                            while (result.items[0].id.kind === 'youtube#video') {
                                var description = result.items[0].snippet.description
                                if (description.indexOf('http') !== -1) {
                                    description = description.replace('http://', '')
                                    description = description.replace('https://', '')
                                }
                            }
                            messgnt('<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\nDescription: ' + description + '\nhttps://www.youtube.com/channel/' + result.items[0].id.channelId)
                        } else if (result.items[0].id.kind === 'youtube#playlist') {
                            if (result.items[0].id.kind === 'youtube#video') {
                                var description = result.items[0].snippet.description
                                while (description.indexOf('http') !== -1) {
                                    description = description.replace('http://', '')
                                    description = description.replace('https://', '')
                                }
                            }
                            messgnt('<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\nDescription: ' + description + '\nhttps://www.youtube.com/playlist?list=' + result.items[0].id.playlistId)
                        } else {
                            messgnt('<@' + userID + '> Sorry I could not retrieve that :confused:')
                        }
                    } catch (e) {
                        logger.error("Youtube Fetch Failed " + e + " | " + ytcall)
                        messgnt('<@' + userID + '> Sorry I could not retrieve that :confused:')
                        console.log(e)
                    }
                }
            });
            bot.deleteMessage({
                channel: channelID,
                messageID: messageID
            });
        }
        if (message.toLowerCase().indexOf('skip') === 1 && ignore !== true) {
            bot.deleteMessage({
                channel: channelID,
                messageID: messageID
            })
        }
        //Makes scratch execute jvascript, warning this command is really powerful and is limited to owner access only
        if (message.toLowerCase().indexOf('js') === 1 && userID.indexOf(ownerId) === 0) {
            var jscmd = message
            var jscall = jscmd.replace('!js ', '')
            try {
                eval(jscall)
            } catch (e) {
                logger.error("Bad JS Command " + e)
                messgnt("Err...I'm sorry...that results in a error")
            }
            rconcmd = 'Yes'
        }
        if (message.toLowerCase().indexOf('js') === 1 && userID.indexOf('70921043782402048') === -1) {
            messgnt('<@' + userID + "> You are not allowed to use this command, only <@" + ownerId + "> can because it can damage the bot")
        } else if (rconcmd === 'no') {
            logger.info(commandmod + ' was said but there was No Detected command');
        }
    }
    if (channelID === '164845697508704257') {
        console.log(message)
        fs.appendFile("logs/space.txt", '\n\n' + message)
    }
    if (channelID === '167855344129802241') {
        console.log(message)
        fs.appendFile("logs/unknown.txt", '\n\n' + message)
    }
    //Special conditions to prevent the logging of bots and specially monitored chats
    if (userID.indexOf('104867073343127552') === 0 || channelID.indexOf('164845697508704257') === 0 || channelID.indexOf('167855344129802241') === 0) {
        if (userID === '104867073343127552') {
            console.log("Ignoring BooBot's message for logging");
        } else if (channelID.indexOf('164845697508704257') === 0) {
            console.log('Message from Space chat, logging to file space.txt');
        } else if (channelID.indexOf('167855344129802241')) {
            console.log('Message from Unknown chat, logging to file space.txt');
        }
    } else if (rconcmd === "No" && ignore !== true) {
        var timed = Date()
        timed = '[' + timed.replace(' GMT-0500 (CDT)', '') + '] '
        timed = timed.replace('GMT-0500 (Central Daylight Time)', '')
        if (channelID in bot.directMessages) {
            console.log(timed + 'Channel: ' + 'PM | ' + user + ': ' + message)
            fs.appendFile("logs/" + user + ".txt", '\n' + timed + user + ": " + message)
        } else {
            servern = bot.servers[serverID].name
            channeln = bot.servers[serverID].channels[channelID].name
            console.log(timed + 'Channel: ' + servern + '/' + channeln + ' | ' + user + ': ' + message)
            //fs.appendFile("logs/Main LOG.txt", '\n' + timed + user + ": " + message)
            fs.appendFile("logs/" + servern + '.' + channeln + '.txt', '\n' + timed + user + ": " + message)
        }
    } else if (userID.indexOf('104867073343127552') != 0 || channelID.indexOf('164845697508704257') != 0 && rconcmd === "Yes" && ignore !== true) {
        if (ignore !== true) {
            logger.info('Last Message User: ' + user + ' | IDs: ' + ' ' + userID + '/' + channelID + ' | Reconized command?: ' + rconcmd + ' | Message: ' + message);
        }
    }
});
bot.on('debug', function(rawEvent) {
    if (rawEvent.t === "MESSAGE_UPDATE") {
        //messageSend(rawEvent.d.channel_id, "Did you just update a message?")
    }
});

/* Start of console input */
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
rl.on('line', function(line) {
    consoleparse(line);
})