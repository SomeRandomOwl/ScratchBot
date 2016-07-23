var moment = require('moment');
module.exports = function(ID, callback) {
    const timestamp = new Date(parseInt(ID) / 4194304 + 1420070400000);
    const createdM = moment.utc(timestamp);
    const created = createdM.format("MM-DD-YYYY hh:mm:ss");
    if (typeof callback === "function") {
        const err = false;
        const response = created;
        callback(err, response);
    }
}