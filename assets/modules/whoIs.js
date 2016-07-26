/*/WhoIs/*/
var cmds = require('./')
module.exports = function(bot, storage, name, serverID, self, callback) {
    try {
        console.log(name)
        userID = storage.d.Users[name].id
        roles = bot.servers[serverID].members[userID].roles
        nick = bot.servers[serverID].members[userID].nick
        mute = bot.servers[serverID].members[userID].mute
        deaf = bot.servers[serverID].members[userID].deaf
        join = bot.servers[serverID].members[userID].joined_at
        status = bot.servers[serverID].members[userID].status
        userN = bot.users[userID].username
        discriminator = bot.users[userID].discriminator
        avatar = bot.users[userID].avatar
        botT = bot.users[userID].bot
        game = bot.users[userID].game
        botT = JSON.stringify(botT)
    } catch (e) {
        console.log(e)
    }
    try {
        if (roles.length !== 0) {
            rolesm = 'Everyone, '
            for (var i = 0; i < roles.length; i++) {
                if (i !== roles.length - 1) {
                    roleN = bot.servers[serverID].roles[roles[i]].name
                    roleN = roleN.replace(' ', '')
                    rolesm = rolesm + roleN + ', '
                } else {
                    roleN = bot.servers[serverID].roles[roles[i]].name
                    roleN = roleN.replace(' ', '')
                    rolesm = rolesm + roleN
                }

            }
        } else {
            rolesm = 'Everyone'
        }
    } catch (e) {
        rolesm = 'Everyone'
    }
    ChtTime = cmds.util.secondsToTime(cmds.util.gettime() - storage.d.Users[name].lastChatR)
    lastChat = ""
    if (ChtTime.d > 0) {
        if (ChtTime.d === 1) {
            lastChat = "1 Day "
        } else {
            lastChat = ChtTime.d + " Days "
        }
    }
    if (ChtTime.h > 0) {
        if (ChtTime.h === 1) {
            lastChat = lastChat + "1 Hour "
        } else {
            lastChat = lastChat + ChtTime.h + " Hours "
        }
    }
    if (ChtTime.m > 0) {
        if (ChtTime.m === 1) {
            lastChat = lastChat + "1 Minute "
        } else {
            lastChat = lastChat + ChtTime.m + " Minutes "
        }
    }
    if (ChtTime.s > 0) {
        if (ChtTime.s === 1) {
            lastChat = lastChat + "1 Second "
        } else {
            lastChat = lastChat + ChtTime.s + " Seconds "
        }
    }

    lastChat = lastChat + '\n               (' + storage.d.Users[name].lastChat + ')'

    avatarL = '"https://discordapp.com/api/users/' + userID + '/avatars/' + avatar + '.jpg"'
    if (self) {
        cmds.creationDate(userID, function(err, creation) {
            message = '' +
                'Name:          ' + userN + '#' + discriminator + '\n' +
                'Nickname:      ' + nick + '\n' +
                'ID:            ' + userID + '\n\n' +
                'Status:        ' + status + '\n' +
                'Roles:         ' + rolesm + '\n' +
                'Bot:           ' + botT + '\n' +
                'Muted:         ' + mute + '\n' +
                'Deafened:      ' + deaf + '\n\n' +
                'Joined:        ' + join + '\n' +
                'Created:       ' + creation + '\n' +
                'Avatar:        ' + avatarL
            if (typeof callback === "function") {
                const response = message;
                callback(true, response);
            }
        })
    } else {
        message = '' +
            'Name:          ' + userN + '#' + discriminator + '\n' +
            'Nickname:      ' + nick + '\n' +
            'ID:            ' + userID + '\n\n' +
            'Status:        ' + status + '\n' +
            'LastChat:      ' + lastChat + '\n\n' +
            'Roles:         ' + rolesm + '\n' +
            'Bot:           ' + botT + '\n' +
            'Muted:         ' + mute + '\n' +
            'Deafened:      ' + deaf + '\n\n' +
            'Joined:        ' + join + '\n' +
            'Avatar:        ' + avatarL
    }
    return message
}