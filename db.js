var config = require('../../config.json'),
    mysql = require('mysql'),
    db = mysql.createConnection({
        host: 'localhost',
        user: config.mySQLUser,
        password: config.mySQLPass,
        database: config.mySQLDb,
        supportBigNumbers: true,
        bigNumberStrings: true,

    }),
    cache = {};
exports.con = db
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
        query = "INSERT INTO " + loc + "(" + change[0] + ") VALUES (" + changeST + ")"
        if (q.debug) {
            console.log(query)
        }
        db.query(query, function(err, rows) {
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
        })
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
        query = "UPDATE " + loc + ' SET ' + changeST + " WHERE `" + loc + "`.`" + id + "` = '" + where + "'"
        if (q.debug) {
            console.log(query)
        }
        db.query(query, function(err, rows) {
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
        })
    } else if (q.type.toUpperCase() === 'SELECT') {
        var what = q.what,
            loc = q.location,
            where = q.where,
            id = q.id
        if (id !== undefined) {
            query = "SELECT " + what + " FROM " + loc + " WHERE " + id + " LIKE '%" + where + "%'"
            CacheThis = true
        } else {
            query = "SELECT " + what + " FROM " + loc
        }
        if (q.debug) {
            console.log(query)
        }
        db.query(query, function(err, rows) {
            if (id !== undefined) {
                if (cache[loc] === undefined) {
                    cache[loc] = {}
                }
                cache[loc][where] = rows[0]
            }
            exports.cache = cache
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
        })
    }
}