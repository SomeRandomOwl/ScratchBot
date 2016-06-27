/*/Gets seconds using Date.now()/*/
module.exports = function() {
    var timenow = Math.floor(Date.now() / 1000)
    return timenow
}