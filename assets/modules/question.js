var activeQ = {}
var shortid = require('shortid');

var ask = function(question) {
    questions[shortid.generate()] = question
    console.log(questions)
}
var answer = function(answer) {
    console.log('yes')
}
var exp = {
    activeQ,
    ask,
    answer
}
module.exports = exp