module.exports = function(bot, storage, config) {
    const module = {};


    var secondsToTime = require('./secondsToTime.js')
    var gettime = require('./gettime.js')
    var writeJSON = require('./writeJSON.js')
    var isInArray = require('./isInArray.js')
    var whoIs = require('./whoIs.js')
    var toSentenceCase = require('./toSentenceCase.js')
        //var messageSend = require('./messageSend.js')(bot, storage)

    var util = {
        secondsToTime,
        gettime,
        writeJSON,
        isInArray,
        whoIs,
        toSentenceCase
        //messageSend
    }

    module.voiceLines = require('./voiceLines.js')
    module.mtg = require('./mtg.js')
    module.list = require('./lists.js')
    module.question = require('./question.js')
    module.util = util

    return module;
}