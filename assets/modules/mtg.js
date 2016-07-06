var request = require('request');
var toSentenceCase = require('./toSentenceCase.js')
module.exports = function(bot, messageSend, channelID, card) {
    console.log(messageSend, channelID, card)
    request("https://api.magicthegathering.io/v1/cards?name=" + card + "&pageSize=1", function(error, response, body) {
        body = JSON.parse(body);
        message = "" +
            'Name:    ' + body.cards[0].name + '  ' + 'Cost:' + body.cards[0].manaCost + '\n' +
            'Set:     ' + toSentanceCase(body.cards[0].setName) + '\n' +
            'Type:    ' + body.cards[0].type + '\n' +
            'Rarity:  ' + body.cards[0].rarity + '\n' +
            'Text:     \n' + body.cards[0].text.toLowerCase() + '\n'
        art = 'http://magiccards.info/scans/en/' + body.cards[0].set.toLowerCase() + '/' + body.cards[0].number + '.jpg'
        messageSend(channelID, message, true, 'xl', false, null, art)
    })
}

/*   [ { name: 'Archangel Avacyn',
       names: [Object],
       manaCost: '{3}{W}{W}',
       cmc: 5,
       colors: [Object],
       type: 'Legendary Creature — Angel',
       supertypes: [Object],
       types: [Object],
       subtypes: [Object],
       rarity: 'Mythic Rare',
       set: 'SOI',
       setName: 'Shadows over Innistrad',
       text: 'Flash\nFlying, vigilance\nWhen Archangel Avacyn enters the battlefield, creatures you control gain indestructible until end of turn.\nWhen a non-Angel creature you control dies, transform Archangel Avacyn at the beginning of the next upkeep.',
       artist: 'James Ryman',
       number: '5a',
       power: '4',
       toughness: '4',
       layout: 'double-faced',
       multiverseid: 409741,
       imageUrl: 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=409741&type=card',
       rulings: [Object],
       foreignNames: [Object],
       printings: [Object],
       originalText: 'Flash\nFlying, vigilance\nWhen Archangel Avacyn enters the battlefield, creatures you control gain indestructible until end of turn.\nWhen a non-Angel creature you control dies, transform Archangel Avacyn at the beginning of the next upkeep.',
       originalType: 'Legendary Creature — Angel',
       legalities: [Object],
       id: '02ea5ddc89d7847abc77a0fbcbf2bc74e6456559' } ] }*/