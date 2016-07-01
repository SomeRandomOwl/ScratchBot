var questions = {}
var shortid = require('shortid');

exports.ask = function(question) {
    id = shortid.generate()
    questions[id] = question
    return id
    exports.active = questions
}
exports.answer = function(id, all) {
    if (!all) {
        delete questions[id]
    } else {
        for (var id in cmds.question.active) {
            delete cmds.question.active[id]
        }
    }
    exports.active = questions
}
exports.active = questions