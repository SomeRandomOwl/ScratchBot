/*/Function to write json to the storage file/*/
var fs = require('fs');
module.exports = function(path, data) {
    fs.writeFile(path + '.tmp', JSON.stringify(data, null, "\t"), function(error) {
        if (error) {
            return error;
        }
        fs.rename(path + '.tmp', path + '.json', function(error) {
            if (error) {
                return error;
            }
        });
    });
}
