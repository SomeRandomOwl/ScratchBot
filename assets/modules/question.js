var questions = {}
var shortid = require('shortid');
module.exports = function(bot, storage, config) {
    const module = {};

    module.ask = function(question) {
        id = shortid.generate()
        questions[id] = question
        return id
        module.active = questions
    }
    module.answer = function(id, all) {
        if (!all) {
            delete questions[id]
        } else {
            for (var id in questions) {
                delete questions[id]
            }
        }
        module.active = questions
    }
    module.active = questions
}