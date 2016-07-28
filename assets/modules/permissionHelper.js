/*
    Permission Helper

    Author:  Frosthaven
    Twitter: @thefrosthaven

    Description:
        This plugin adds useful methods for handling
        permissions within discord
*/

module.exports = function plugin(bot) {
    "use strict";

    const plugin = {};

    //plugin------------------------------------
    plugin.permissions = {
        GEN_CREATE_INSTANT_INVITE: 0,
        GEN_KICK_MEMBERS: 1,
        GEN_BAN_MEMBERS: 2,
        GEN_ADMINISTRATOR: 3,
        GEN_MANAGE_CHANNELS: 4,
        GEN_MANAGE_GUILD: 5,
        GEN_CHANGE_NICKNAME: 26,
        GEN_MANAGE_NICKNAMES: 27,
        GEN_MANAGE_ROLES: 28,

        CHAT_READ_MESSAGES: 10,
        CHAT_SEND_MESSAGES: 11,
        CHAT_SEND_TTS_MESSAGES: 12,
        CHAT_MANAGE_MESSAGES: 13,
        CHAT_EMBED_LINKS: 14,
        CHAT_ATTACH_FILES: 15,
        CHAT_READ_MESSAGE_HISTORY: 16,
        CHAT_MENTION_EVERYONE: 17,

        VOICE_CONNECT: 20,
        VOICE_SPEAK: 21,
        VOICE_MUTE_MEMBERS: 22,
        VOICE_DEAFEN_MEMBERS: 23,
        VOICE_MOVE_MEMBERS: 24,
        VOICE_USE_VAD: 25,
    };

    /**
     * adds a permission overwrite to a channel
     * @param {object}   params             [object of parameters]
     * @param {string}   params.type        ['user' or 'role']
     * @param {string}   params.id          [user id or role id]
     * @param {string}   params.method      ['deny' or 'allow']
     * @param {string}   params.channelID   [the channel id]
     * @param {object}   params.permissions [an array or object of permissions to include]
     * @param {Function} callback           [code to run after the permission overwrite has been applied]
     */
    plugin.addChannelPermissions = function(params, callback) {
        //setup the payload based on parameter input
        const payload = {
            type: params.type,
            id: params.id,
            deny: params.method === "allow" ? 0 : plugin.encodePerm(params.permissions),
            allow: params.method === "deny" ? 0 : plugin.encodePerm(params.permissions)
        };

        //define the endpoint and do a PUT request
        const endpoint = "https://discordapp.com/api/channels/" + params.channelID + "/permissions/" + params.id;
        bot._req("put", endpoint, payload, function(err, res) {
            if (!err && res.statusCode !== 204) {
                err = "Something went wrong at PUT endpoint " + endpoint;
            }
            if (typeof callback === "function") {
                callback(err, bot.channels[params.channelID]);
            }
        });
    };

    /**
     * removes a permission overwrite to a channel
     * @param {object}   params           [object of parameters]
     * @param {string}   params.id        [user id or role id]
     * @param {string}   params.channelID [the channel id]
     * @param {Function} callback         [code to run after the permission overwrite has been deleted]
     */
    plugin.deleteChannelPermissions = function(params, callback) {
        //define the endpoint and do a DELETE request
        const endpoint = "https://discordapp.com/api/channels/" + params.channelID + "/permissions/" + params.id;
        bot._req("delete", endpoint, null, function(err, res) {
            if (!err && res.statusCode !== 204) {
                err = "Something went wrong at DELETE endpoint " + endpoint;
            }
            if (typeof callback === "function") {
                callback(err, bot.channels[params.channelID]);
            }
        });
    };

    /**
     * converts a bitwise permission string into
     * an object of human readable permissions
     * @param  {string} permStr [the bitwise permission string]
     * @return {obj}            [an object containing human readable permissions]
     */
    plugin.decodePerm = function(permStr) {
        if (!permStr || permStr === "") {
            return false;
        }
        permStr = parseInt(permStr);

        const perms = {};
        Object.keys(plugin.permissions).forEach(function(flag) {
            perms[flag] = (permStr & 1 << plugin.permissions[flag]) > 0;
        });
        return perms;
    };

    /**
     * converts an object or array of human readable
     * permissions into a bitwise permission string
     * @param  {object} permObj [the object or array of permissions]
     * @return {string}         [the bitwise permission string]
     */
    plugin.encodePerm = function(permObj) {
        let permStr = 0;

        if (Object.prototype.toString.call(permObj) === '[object Array]') {
            //treat as an array
            Object.keys(plugin.permissions).forEach(function(flag) {
                if (permObj.indexOf(flag) > -1) {
                    permStr |= 1 << plugin.permissions[flag];
                }
            });
        } else {
            //treat as an object
            Object.keys(plugin.permissions).forEach(function(flag) {
                if (permObj[flag]) {
                    permStr |= 1 << plugin.permissions[flag];
                }
            });
        }

        return permStr;
    };

    /**
     * checks for every enabled bit within a
     * bitwise permission string up to 53 bits
     * @param  {string} perm [the bitwise permission string]
     * @return {array}       [an array of enabled bits found]
     */
    plugin.bitCheck = function(perm) {
        if (typeof perm === "string" || typeof perm === "number") {
            perm = parseInt(perm);
        } else if (typeof perm === "object") {
            perm = parseInt(plugin.encodePerm(perm));
        }

        const bits = [];
        for (let i = 0; i <= 53; i++) {
            if ((perm & 1 << i) > 0) {
                bits.push(i);
            }
        }

        return bits;
    };

    return plugin;
};