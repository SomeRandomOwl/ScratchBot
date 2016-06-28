var secondsToTime = require('./secondsToTime.js')
var gettime = require('./gettime.js')
var writeJSON = require('./writeJSON.js')
var isInArray = require('./isInArray.js')
var whoIs = require('./whoIs.js')
var util = {
    secondsToTime, gettime, writeJSON, isInArray, whoIs
}

exports.list = require('./lists.js')
exports.question = require('./question.js')
exports.util = util