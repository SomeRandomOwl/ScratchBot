var object = {"settings":{"debug":0,"ignoredChannels": []},"d":{"Channels":{"test":{"id":"null","settings":{}}},"Servers":{"test":{"id":"null","settings":{}}},"Users":{"test":{"id":"null","settings":{}}}}}
require('fs').writeFileSync('./storage.json', JSON.stringify(object, null, '\t'))
