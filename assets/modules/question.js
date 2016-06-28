var questions = {}
var shortid = require('shortid');

exports.ask = function(question) {
    questions[shortid.generate()] = question
    console.log(questions)
}
exports.answer = function(answer) {
    console.log('yes')
}
exports.active = questions