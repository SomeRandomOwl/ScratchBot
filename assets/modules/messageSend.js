var winston = require('winston');
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
/*/Used to send messages and keep tack of the message id/*/
module.exports = function(channelID, msg, cb, type, mention, userID, preText, bot, storage) {
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
                    msg = '<@' + userID + '> ' + preText + '\n```' + type + '\n' + msg + '```'
                } else {
                    msg = '<@' + userID + '>\n```' + type + '\n' + msg + '```'
                }
            } else {
                if (type === 'json') {
                    msg = JSON.stringify(msg, null, '\t')
                }
                if (preText !== undefined) {
                    msg = preText + '\n```' + type + '\n' + msg + '```'
                } else {
                    msg = '```' + type + '\n' + msg + '```'
                }
            }
        } else {
            if (mention === true) {
                if (preText !== undefined) {
                    msg = '<@' + userID + '> ' + preText + '\n\n```' + msg + '```'
                } else {
                    msg = '<@' + userID + '>\n```' + msg + '```'
                }
            } else {
                if (preText !== undefined) {
                    msg = preText + '\n```' + msg + '```'
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