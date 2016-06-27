exports.secondsToTime = function(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var days = Math.floor(hours / 24)
    while (hours > 23) {
        hours = hours - 24
    }
    var obj = {
        "d": days,
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}