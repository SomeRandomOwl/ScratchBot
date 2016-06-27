var question = require('./question.js')
var secondsToTime = require('./secondsToTime.js')
var gettime = require('./gettime.js')
var writeJSON = require('./writeJSON.js')
var lists = require('./lists.js')
var isInArray = require('./isInArray.js')

var util = {
    secondsToTime,
    gettime,
    writeJSON,
    isInArray
}

exports.list = lists
exports.question = question
exports.util = util