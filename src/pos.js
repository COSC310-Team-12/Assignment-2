const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const WordPOS = require('wordpos');
const wordpos = new WordPOS();

var com_phrase = {}; // word => rank
initialize();

// load word ranking
function initialize() {
    fs.createReadStream(path.resolve(__dirname, 'data', 'wordFrequency.csv'))
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => (com_phrase[row.word] = parseInt(row.rank)))
        .on('end', rowCount => console.log(com_phrase));
}

// Pos & Synonyms recongnition
// Replaces complex adjectives/adverbs with simple, higher ranked synonyms
// Improves the chance of the bot of correctly understanding the sentence
async function process(sentence) {
    if (sentence.length < 1)
        return '';

    var adjectives, adverbs;
    await wordpos.getPOS(sentence, function (element) {
        adjectives = element.adjectives;
        adverbs = element.adverbs;
    });

    if (adjectives) {
        for (var adj of adjectives) {
            var newadj = adj;
            var rank = getrank(adj);
            await wordpos.lookupAdjective(adj, function (definitions) {
                var synonyms = definitions[0].synonyms;
                if (synonyms) {
                    synonyms.forEach(syn => {
                        if (getrank(syn) < rank) {
                            newadj = syn;
                            rank = getrank(syn);
                        }
                    });
                }
            });
            sentence = sentence.replace(adj, newadj);
            //console.log(adj, getrank(adj), newadj, rank);
        }
    }

    if (adverbs) {
        for (var adv of adverbs) {
            var newadv = adv;
            var rank = getrank(adv);
            await wordpos.lookupAdverb(adv, function (definitions) {
                var synonyms = definitions[0].synonyms;
                if (synonyms) {
                    synonyms.forEach(syn => {
                        if (getrank(syn) < rank) {
                            newadv = syn;
                            rank = getrank(syn);
                        }
                    });
                }
            });
            sentence = sentence.replace(adv, newadv);
            //console.log(adv, getrank(adv), newadv, rank);
        }
    }
    return sentence;
}


function getrank(word) {
    if (com_phrase[word])
        return com_phrase[word];
    else
        return Number.MAX_SAFE_INTEGER;
}

exports.process = process;