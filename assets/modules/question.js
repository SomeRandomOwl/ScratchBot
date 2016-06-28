var questions = {}
var shortid = require('shortid');

exports.ask = function(question) {
    questions[shortid.generate()] = question
    questions = JSON.parse(JSON.stringify(questions, null, '\t'))
    console.log(questions)
}
exports.answer = function(answer) {
    console.log('yes')
}
exports.active = questions