module.exports = function(callback) {
    var list = require('../game.json')
    rN1 = Math.floor(Math.random() * list[0].length)
    rN2 = Math.floor(Math.random() * list[1].length)
    rn3 = Math.floor(Math.random() * list[2].length)
    name = list[0][rN1] + ' ' + list[1][rN2] + ' ' + list[2][rN3]
    if (typeof callback === "function") {
        //callback was a function, so we can now call it and send whatever
        const err = false;
        const response = name;
        callback(err, response);
    }
}