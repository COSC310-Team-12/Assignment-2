var Typo = require("typo-js");
var dictionary = new Typo("en_US");

function fix(sentence) {
    if (sentence.length < 1)
        return '';
        
    sentence.replace(/[^A-Za-z0-9]/g, ''); //Re
    var words = sentence.split(" ");

    for (var i = 0; i < words.length; i ++) {
        var word = words[i];
        var punc = word.charAt(word.length - 1);
        if (is_punc(punc)) {
            word = word.slice(0, -1);
        } else {
            punc = "";
        }

        if (!dictionary.check(word)) {
            word = dictionary.suggest(word)[0];
        }
        words[i] = word + punc;
    }
    
    return words.join(' ');
}

function is_punc(word) {
    return !!word.match(/^[.,:!?]/);
}

exports.fix = fix;