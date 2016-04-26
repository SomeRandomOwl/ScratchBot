var storageDefault = {
	"settings": {
		"debug": 0
	},
	"Channels": {
		"test": {
			"id": "null",
			"settings": {}
		}
	},
	"Servers": {
		"test": {
			"id": "null",
			"settings": {}
		}
	},
	"Users": {
		"test": {
			"id": "null",
			"settings": {}
		}
	}
}

var fs = require('fs');

function writeJSON(path, data, callback) {
	fs.writeFile(path + '.tmp', JSON.stringify(data), function(error) {
		if (error) {
			callback(error);
			return;
		}
		fs.rename(path + '.tmp', path + '.json', function(error) {
			if (error) {
				callback(error);
				return;
			}
			callback(null);
		});
	});
}

if (fs.existsSync('storage.json')) {
	console.log('Found Storage.json');
	var storage = require('./storage.json')
} else if (fs.existsSync('storage.json') === false) {
	console.log('Didnt Find Storage.json, creating');
	writeJSON('./storage', storageDefault, function(error) {
			if (error) {
				console.error(error);
				return;
		}
	});
	process.exit()
}
