var questions = {}
var shortid = require('shortid');

exports.ask = function(question) {
    id = shortid.generate()
    questions[id] = question
    console.log(questions)
    return id
    exports.active = questions
}
exports.answer = function(answer) {
    console.log('yes')
    exports.active = questions
}
exports.active = questions