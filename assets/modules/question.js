var questions = {}
var shortid = require('shortid');

exports.ask = function(question) {
    id = shortid.generate()
    questions[id] = question
    questions = JSON.parse(JSON.stringify(questions, null, '\t'))
    console.log(questions)
    return id
}
exports.answer = function(answer) {
    console.log('yes')
}
exports.active = questions