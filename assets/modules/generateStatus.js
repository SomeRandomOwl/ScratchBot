var fs = require('fs')
var file;

fs.readFile('./assets/game.txt', 'utf8', function(err, data) {
    file = data
})

function build_list(big_list) {
    var words = big_list.split("\n");
    var word_list = []
    var word_list_index = 0;
    for (var word in words) {
        if (words[word] == "----") {
            word_list_index++;
            word_list[word_list_index] = []
        } else {
            word_list[word_list_index].push(words[word]);
        }
    }
}
build_list(file)

module.exports = function(callback) {
    fs.readFile('./assets/game.txt', 'utf8', function(err, data) {
        file = data
        build_list(file)
    })
    var first_word = word_list[0][Math.floor(Math.random() * word_list[0].length)];
    var second_word = "";
    var third_word = "";
    var bad_match_list = new Array();

    var allow_similar_matches = !$('#similar_terms').is(':checked');

    if (first_word.indexOf("^") != -1) {
        if (!allow_similar_matches) {
            bad_match_list = first_word.split("^")[1].split('|');
        }
        first_word = first_word.split("^")[0];
    }

    var second_word_bad = true;
    while (second_word_bad) {
        second_word = word_list[1][Math.floor(Math.random() * word_list[1].length)];
        if (second_word.indexOf("^") != -1) {
            if (!allow_similar_matches) {
                bad_match_list.concat(second_word.split('^')[1].split('|'));
            }
            second_word = second_word.split('^')[0];
        }

        if (second_word == first_word) {
            continue;
        }

        if ($.inArray(second_word, bad_match_list) != -1) {
            continue;
        }
        second_word_bad = false;
    }

    var third_word_bad = true;
    while (third_word_bad) {
        third_word = word_list[2][Math.floor(Math.random() * word_list[2].length)];

        if (third_word.indexOf("^") != -1) {
            if (!allow_similar_matches) {
                bad_match_list.concat(third_word.split('^')[1].split('|'));
            }
            third_word = second_word.split('^')[0];
        }

        if (third_word == first_word || third_word == second_word) {
            continue;
        }

        if ($.inArray(third_word, bad_match_list) != -1) {
            continue;
        }
        third_word_bad = false;
    }
    if (typeof callback === "function") {
        //callback was a function, so we can now call it and send whatever
        const err = false;
        const response = first_word + " " + second_word + " " + third_word;
        callback(err, response);
    }
}
}