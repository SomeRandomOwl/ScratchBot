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

exports.voiceLines = require('./voiceLines.js')
exports.mtg = require('./mtg.js')
exports.list = require('./lists.js')
exports.question = require('./question.js')
exports.creationDate = require('./creationDate.js')
exports.gNG = require('./gNG.js')
exports.util = util