//Welcome, this is scratch bots source code, everything that makes her run and tick!
var DiscordClient = require('discord.io');
var winston = require('winston');
var config = require('../../config.json');
var fs = require('fs');
var Roll = require('roll'),
	roll = new Roll();
var math = require('mathjs');
var readline = require('readline');
var YouTube = require('youtube-node');
var youTube = new YouTube();
var imgur = require('imgur-node-api');

youTube.setKey(config.youTubeApiKey)

var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)(),
		new(winston.transports.File)({
			filename: 'logs/Command.log'
		})
	]
});

//Bot credentials
var bot = new DiscordClient({
	autorun: true,
	//email: config.email,
	//password: config.pass,
	token: config.token
});

//Start up console output
bot.on('ready', function() {
	logger.info(bot.username + " - (" + bot.id + ")" + " Is now running");
});

//Global variable setting
imgur.setClientID(config.imgurId);
var storageDefault = {
	"settings": {
		"debug": 0
	},
	"Channels": {
		"test": {
			"id": "null",
			"settings": {}
		}
	},
	"Servers": {
		"test": {
			"id": "null",
			"settings": {}
		}
	},
	"Users": {
		"test": {
			"id": "null",
			"settings": {}
		}
	}
}
var logChan = config.logChan
var sentPrevId = null
var commandmod = config.cmdMod
var ownerId = config.ownerId
var rconcmd = 'No'
var clist = '\nUtility: !commands, !math, !ids, !supportedmath, !yt, !triggers\nOther: !picture'
var tlist = '\nUtility: ping\nPolite replies: goodnight,  nite,  night, hi, hello'
var nighttig = ['night', 'nite', 'goodnight', "g'nite", 'nighty nite!']
var debug = false
var serverID = null

function writeJSON(path, data, callback) {
	fs.writeFile(path + '.tmp', JSON.stringify(data), function(error) {
		if (error) {
			callback(error);
			return;
		}
		fs.rename(path + '.tmp', path + '.json', function(error) {
			if (error) {
				callback(error);
				return;
			}
			callback(null);
		});
	});
}

if (fs.existsSync('storage.json')) {
	console.log('Found Storage.json');
	var storage = require('./storage.json')
} else if (fs.existsSync('storage.json') === false) {
	console.log('Didnt Find Storage.json, creating');
	writeJSON('./storage', storageDefault, function(error) {
			if (error) {
				console.error(error);
				return;
		}
	});
var storage = require('./storage.json')
}

function isInArray(value, array) {
	return array.indexOf(value) > -1;
}

function cnsmsg(chan, msg) {
	bot.sendMessage({
		to: chan,
		message: msg,
		typing: false
	})
}

function statusmsg(msg) {
	bot.setPresence({
		game: msg
	})
}

bot.on('disconnected', function() {
	logger.error("Bot got disconnected, reconnecting")
	bot.connect()
	logger.info("Reconnected")
		//bot.sendMessage({
		//  to: logChan,
		//  message: "Got disconneted, Reconnected now",
		//  typeing: false
		//})
});

function messageSend(channelID, msg, typing) {
	bot.sendMessage({
		to: channelID,
		message: msg,
		typing: false
	}, function(error, response) {
		console.log('Last Message Sent ID: ' + response.id)
		sentPrevId = response.id
	});
}

bot.on("presence", function(user, userID, status, gameName, rawEvent) {
	console.log(user + " is now: " + status);
	//bot.sendMessage({
	//   to: logChan,
	//   message: user + " is now: " + status,
	//   typing: false
	//});
});

bot.on('message', function(user, userID, channelID, message, rawEvent) {
	rconcmd = 'No'
	var messageID = rawEvent.d.id
	var serverID = bot.serverFromChannel(channelID)
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
	if (message.toLowerCase() === "ping") {
		messgnt("pong")
		rconcmd = 'Yes'
	}
	if (message.toLowerCase() === "rick" && userID != '167017777012408320' && user != 'ScratchBot') {
		var ricks = ["and morty!", "dont forget morty!", "uuuuur morty! er goota git outta here morty! They're onto us!", "Wubba-Lubba Dub Dub!"]
		var rickm = "Morty!"
		rickm = ricks[Math.floor(Math.random() * ricks.length)];
		messgnt(rickm)
		rconcmd = 'Yes'
	}
	if (message.toLowerCase() === "thanks scratch") {
		messgnt("You're Welcome!")
		rconcmd = 'Yes'
	}
	if (message.toLowerCase() === "say hello scratch") {
		messgnt("Hello World")
		rconcmd = 'Yes'
	}
	if (message.toLowerCase() === "hey nice avatar scratch" || message.toLowerCase() === "nice avatar scratch") {
		bot.uploadFile({
			to: channelID,
			file: "avatar.png",
			filename: "avatar.png",
			message: "Thanks! Heres a bigger version!",
			typing: true
		});
		rconcmd = 'Yes'
	}
	if (isInArray(message, nighttig)) {
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
		if (message.toLowerCase().indexOf('roll') === 1) {
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
			if (dice.indexOf('d') != 0 && dice.indexOf('d') != -1) {
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
		if (message.indexOf("avatar") === 1) {
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
		if (message.toLowerCase().indexOf('ids') === 1) {
			bot.sendMessage({
				to: channelID,
				message: '<@' + userID + '>' + ' Your userID is: ' + userID + ' and your channelID is: ' + channelID,
				typing: false
			});
			rconcmd = 'Yes'
		}
		if (message.toLowerCase().indexOf('math') === 1) {
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
		if (message.toLowerCase().indexOf('supportedmath') === 1) {
			bot.uploadFile({
				to: channelID,
				file: "math.png",
				filename: "math.png",
				message: "This is a picture of what shouldent crash me currently",
				typing: false
			});
			rconcmd = "Yes"
		}
		if (message.toLowerCase().indexOf('triggers') === 1) {
			messgnt("Check your PM's :mailbox_with_mail:")
			bot.sendMessage({
				to: userID,
				message: "Here are my triggers!: \n\n```" + tlist + '```\n',
				typing: false
			});
			rconcmd = 'Yes'
		}
		if (message.toLowerCase().indexOf('commands') === 1) {
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
		if (message.toLowerCase().indexOf('poke') === 1) {
			var pkcmd = message
			var pkcall = pkcmd.replace('!poke ', '')
			var pkcall = pkcall.replace('<@', '')
			var pkcall = pkcall.replace('>', '')
			bot.sendMessage({
				to: pkcall,
				message: "Hi <@" + pkcall + "> You where poked by: <@" + userID + "> in: <#" + channelID + ">",
				typing: false
			})
		}
		if (message.toLowerCase().indexOf('yt') === 1) {
			var ytcmd = message
			var ytcall = ytcmd.replace('!yt ', '')
			youTube.search(ytcall, 1, function(error, result) {
				if (error) {
					console.log(error);
				} else {
					console.log(result.items[0])
					try {
						if (result.items[0].id.kind === 'youtube#video') {
							messgnt('<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\n\nDescription: ' + result.items[0].snippet.description + '\nhttps://youtu.be/' + result.items[0].id.videoId)
						} else if (result.items[0].id.kind === 'youtube#channel') {
							messgnt('<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\nDescription: ' + result.items[0].snippet.description + '\nhttps://www.youtube.com/channel/' + result.items[0].id.channelId)
						} else if (result.items[0].id.kind === 'youtube#playlist') {
							messgnt('<@' + userID + '> \nHere is the result for: ' + ytcall + '\n\nTitle: ' + result.items[0].snippet.title + '\nDescription: ' + result.items[0].snippet.description + '\nhttps://www.youtube.com/playlist?list=' + result.items[0].id.playlistId)
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
		if (message.toLowerCase().indexOf('skip') === 1) {
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
	} else if (rconcmd === "No") {
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
	} else if (userID.indexOf('104867073343127552') != 0 || channelID.indexOf('164845697508704257') != 0 && rconcmd === "Yes") {
		logger.info('Last Message User: ' + user + ' | IDs: ' + ' ' + userID + '/' + channelID + ' | Reconized command?: ' + rconcmd + ' | Message: ' + message);
	}
});
var cnaid = '162390519748624384'

function consoleparse(line) {
	if (line.toLowerCase().indexOf('~') === 0) {
		if (line.toLowerCase().indexOf('cnaid') === 1) {
			cnaid = line.replace('~cnaid ', '')
			console.log("Now talking in channel: " + cnaid)
		} else if (line.toLowerCase().indexOf('debg') === 1) {
			debug === true
			console.log('Debug: ' + debug)
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
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
rl.on('line', function(line) {
	consoleparse(line);
})