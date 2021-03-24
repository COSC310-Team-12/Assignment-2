function sort_beam_texts(beam_texts) {
    beam_texts.sort((a, b) => (a.probability < b.probability) ? 1 : -1)
    return beam_texts;
}

function normalize_beam_texts(beam_texts) {
    var sum = 0;
    beam_texts.forEach(beam_text => {
        sum += beam_text.probability;
    });

    beam_texts.forEach(beam_text => {
        beam_text.probability = beam_text.probability / sum;
    });

    return beam_texts;
}

// Select an item out of an array using its probability
function weightedRandom(array) {
    if (!array) return array;

    var weighted = weightArray(array);
    return weighted[Math.floor(Math.random() * weighted.length)];
}

// Filles an array with the correct wieght of each object
function weightArray(array) {
    return [].concat(...array.map((obj) => Array(Math.ceil(obj.probability * 100)).fill(obj)));
}

exports.sort_beam_texts = sort_beam_texts;
exports.normalize_beam_texts = normalize_beam_texts;
exports.weightedRandom = weightedRandom;