// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let $ = jQuery = require('jquery');
const { ipcRenderer } = require('electron');
const { createPopper } = require('@popperjs/core');
const bootstrap = require('bootstrap');
const spellcheck = require('./spell_check');
const pos = require('./pos');
const sentiment = require('./sentiment');
const helper = require('./helper');

const connection = new WebSocket('ws://51.141.164.131:10001/websocket');
let connected = false;

connection.onopen = () => {
    sendMessage("[START]");
    setTimeout(() => {
        showNotification('Connected to server');
        connected = true;
        console.log('connected');
    }, 1000);
};

connection.onclose = () => {
    console.error('disconnected');
};

connection.onerror = error => {
    console.error('failed to connect', error);
};

connection.onmessage = event => {
    var response = processResponse(event.data);
    addToChat(response.message.phrase, 'left');
};

var Message = function (arg) {
    this.text = arg.text, this.message_side = arg.message_side;
    this.draw = function (_this) {
        return function () {
            var $message;
            $message = $($('.message_template').clone().html());
            $message.addClass(_this.message_side).find('.text').html(_this.text);
            $('.messages').append($message);
            return setTimeout(function () {
                return $message.addClass('appeared');
            }, 0);
        };
    }(this);
    return this;
};

// Add messages to the chat window.
var addToChat = function (text, message_side) {
    var $messages, message;
    if (text.trim() === '') {
        return;
    }
    $('.message_input').val('');
    $messages = $('.messages');
    message = new Message({
        text: text,
        message_side: message_side
    });
    message.draw();
    return $messages.animate({
        scrollTop: $messages.prop('scrollHeight')
    }, 300);
};

var getMessageText = function () {
    var $message_input;
    $message_input = $('.message_input');
    return $message_input.val();
};

$('.send_message').click(function (e) {
    sendMessage(getMessageText())
    return addToChat(getMessageText(), 'right');
});

$('.message_input').keyup(function (e) {
    if (e.which === 13) {
        sendMessage(getMessageText())
        return addToChat(getMessageText(), 'right');
    }
});

$("#close").click(function (e) {
    addToChat = function () { };
    showNotification = function () { };
    setTimeout(() => { connection.close(); }, 1000);
    setTimeout(() => { ipcRenderer.sendSync('close_app'); }, 1000);
});

$("#minimize").click(function (e) {
    ipcRenderer.sendSync('minimize_app');
});

var showNotification = function (text) {
    $('#notification_text').text(text);
    $('#notification').toast('show');
};



/* Main Logic Area */
function sendRawMessage(text) {
    if (!connected && text === "") { return; }
    let message = {};
    message["text"] = text;
    connection.send(JSON.stringify(message));
}

async function sendMessage(text) {
    text = spellcheck.fix(text);
    text = await pos.process(text);
    sendRawMessage(text);
};

function processResponse(rawdata) {
    console.groupCollapsed('recieved response');
    console.log(rawdata);
    console.groupEnd();

    rawdata = JSON.parse(rawdata);

    var msg = {
        phrase: rawdata["text"],
        probability: 1
    };

    var response = {
        message: msg,
        beam_texts: transformProbability(rawdata["beam_texts"]),
        quick_reply: rawdata["quick_replies"]
    };

    if (response.beam_texts)
        response.message = helper.weightedRandom(response.beam_texts);

    console.group('processing reponse');

    console.group('message: ');
    console.table([response.message]);
    console.groupEnd();

    console.group('beam_texts: ');
    console.table(response.beam_texts);
    console.groupEnd();

    console.group('quick_reply: ');
    console.table(response.quick_reply);
    console.groupEnd();

    console.groupEnd();

    return response;
}

/**
Function to map probability to logrithmic scale.
This is due to the fact that the difference in 
    probability between each responses are very similar.
Doing this ensures that the response with the highest
    probability will be prefered, even if the difference
    in probability between responses are only a few %
This also give the bot a chance to pick the lower probability
    responses, which makes it more natural.

@param array    Array of messages
**/
function transformProbability(array) {
    if (!array) return array;
    var dict = [];
    var sum = 0;
    array.forEach(function (item) {
        //Create beam_text object
        var beam_text = {
            phrase: item[0],
            probability: item[1]
        }
        dict.push(beam_text);
        sum += beam_text.probability;
    });

    var sum2 = 0;
    for (var i = 0; i < dict.length; i++) {
        var val = dict[i].probability;
        // Map probability to 0-1 scale.
        var prob = 0.01 / (val / sum);
        // Map linear scale to logrithmic scale
        var prob = prob * (1 / (i + 1));

        sum2 += prob;
        dict[i].probability = prob;
    }

    dict.forEach(function (item) {
        // Map probability to 0-1 scale again.
        item.probability = item.probability / sum2;
    });

    // Process sentiment
    dict = sentiment.process(dict);
    return dict;
}

