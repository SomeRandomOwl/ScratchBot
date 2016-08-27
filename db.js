var config = require('../../config.json'),
    mysql = require('mysql'),
    db = mysql.createConnection({
        host: 'localhost',
        user: config.mySQLUser,
        password: config.mySQLPass,
        database: config.mySQLDb,
        supportBigNumbers: true,
        bigNumberStrings: true,

    });
var queue = []
var pause = false
var sleep = 0
var queuer = {
    add: function(item) {
        queue.push(item)
        if (sleep > 4) {
            sleep = 0
            queuer.procces()
        } else {
            sleep = 0
        }
    },
    clear: function() {
        delete queue
        var queue = []
    },
    remove: function(ammount) {
        queue.splice(0, ammount)
    },
    toggle: function() {
        if (pause) {
            pause = false
        } else {
            pause = true
        }
    },
    procces: function() {
        len = queue.length
        if (queue.length > 3) {
            console.log("Warning queue is large it'll take about " + Math.floor(queue.length / 3) + " Seconds to process")
        }
        if (queue.length === 0) {
            sleep++
            console.log('Queue is empty')
        } else {
            for (var i = 0; i < 3; i++) {
                if (queue.length > 0) {
                    db.query(queue[i], function(err, rows) {
                        if (err !== null) {
                            console.log(err)
                        }
                        console.log(queue[i])
                        queuer.remove(1)
                    })
                }
            }
            if (sleep !== 5 && !pause) {
                setTimeout(function() {
                    queuer.procces()
                    console.log("Queue processed " + len + ' Entries')
                }, 1000)
            }
        }
    }
}
queuer.procces()
exports.con = db
exports.queuer = queuer
exports.clq = function(q, callback) {
    if (q.type.toUpperCase() === 'INSERT') {
        var change = q.change,
            loc = q.location
        if (change[1].length !== change[0].length) {
            if (typeof callback === "function") {
                var err = true,
                    response = "The supplied values didnt each have a matching pair";
                callback(err, response);
            }
            return false
        }
        changeST = ''
        for (var i = 0; i < change[0].length; i++) {
            if (change[0].length !== 1) {
                if (i === change[0].length - 1) {
                    changeST = changeST + '"' + change[1][i] + '"'
                } else {
                    changeST = changeST + '"' + change[1][i] + '", '
                }
            } else {
                changeST = changeST + '"' + change[1][i] + '"'
            }
        }
        var query = "INSERT INTO " + loc + "(" + change[0] + ") VALUES (" + changeST + ")"
        if (q.debug) {
            console.log(query)
        }
        /*db.query(query, function(err, rows) {
            if (err !== null) {
                if (typeof callback === "function") {
                    callback(err, rows);
                }
                return false
            } else {
                if (typeof callback === "function") {
                    var err = null,
                        response = rows;
                    callback(err, response);
                }
                return false
            }
        })*/
    } else if (q.type.toUpperCase() === 'UPDATE') {
        var change = q.change,
            loc = q.location,
            where = q.where,
            id = q.id
        changeST = ''
        if (change[1].length !== change[0].length) {
            if (typeof callback === "function") {
                var err = true,
                    response = "The supplied values didnt each have a matching pair";
                callback(err, response);
            }
            return false
        }
        for (var i = 0; i < change[0].length; i++) {
            if (change[0].length !== 1) {
                if (i === change[0].length - 1) {
                    changeST = changeST + ' ' + change[0][i] + " = '" + change[1][i] + "'"
                } else {
                    changeST = changeST + ' ' + change[0][i] + " = '" + change[1][i] + "', "
                }
            } else {
                changeST = changeST + ' ' + change[0][i] + " = '" + change[1][i] + "'"
            }
        }
        var query = "UPDATE " + loc + ' SET ' + changeST + " WHERE `" + loc + "`.`" + id + "` = '" + where + "'"
        if (q.debug) {
            console.log(query)
        }
        /*db.query(query, function(err, rows) {
            if (err !== null) {
                if (typeof callback === "function") {
                    callback(err, rows);
                }
                return false
            } else {
                if (typeof callback === "function") {
                    var err = null,
                        response = rows;
                    callback(err, response);
                }
                return false
            }
        })*/
    } else if (q.type.toUpperCase() === 'SELECT') {
        var what = q.what,
            loc = q.location,
            where = q.where,
            id = q.id
        if (id !== undefined) {
            var query = "SELECT " + what + " FROM " + loc + " WHERE " + id + " LIKE '%" + where + "%'"
        } else {
            var query = "SELECT " + what + " FROM " + loc
        }
        if (q.debug) {
            console.log(query)
        }
        /*db.query(query, function(err, rows) {
            if (err !== null) {
                if (typeof callback === "function") {
                    callback(err, rows);
                }
                return false
            } else {
                if (typeof callback === "function") {
                    var err = null,
                        response = rows;
                    callback(err, response);
                }
                return false
            }
        })*/
    }
    queuer.add(query)
}