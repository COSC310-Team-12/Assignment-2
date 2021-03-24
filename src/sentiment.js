const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const helper = require('./helper');

// Make the bot prefer responses with high sentiment value
// This will make the bot to give a more positive respond, and try to avoid negative responses.
function process(beam_texts) {
    for (var i = 0; i < beam_texts.length; i++) {
        var beam_text = beam_texts[i];
        var comparative = sentiment.analyze(beam_text.phrase).comparative;
        var weight = (comparative + 5) / 10 * 2; //Map range from -5, 5 to 0, 2
        beam_texts[i].probability = beam_texts[i].probability * weight;
    }
    beam_texts = helper.normalize_beam_texts(beam_texts);
    beam_texts = helper.sort_beam_texts(beam_texts);
    return beam_texts;
}

exports.process = process;