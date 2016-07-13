module.exports = function(bot, storage, config) {
    const module = {};


    var secondsToTime = require('./secondsToTime.js')
    var gettime = require('./gettime.js')
    var writeJSON = require('./writeJSON.js')
    var isInArray = require('./isInArray.js')
    var whoIs = require('./whoIs.js')
    var toSentenceCase = require('./toSentenceCase.js')
    var messageSend = require('./messageSend.js')(bot, storage)

    var util = {
        secondsToTime,
        gettime,
        writeJSON,
        isInArray,
        whoIs,
        toSentenceCase
        messageSend
    }

    module.voiceLines = require('./voiceLines.js')(util)
    module.mtg = require('./mtg.js')(util)
    module.list = require('./lists.js')(util)
    module.question = require('./question.js')(util)
    module.util = util

    return module;
}