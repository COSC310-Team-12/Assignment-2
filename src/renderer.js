// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let $ = jQuery = require('jquery');
const { ipcRenderer } = require('electron');
const { createPopper } = require('@popperjs/core');
const bootstrap = require('bootstrap');

const connection = new WebSocket('ws://127.0.0.1:10001/websocket');
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
    console.log('received', event.data);
    var response = processResponse(event.data);
    addToChat(response.message.phrase, 'left');
};

$("#close").click(function (e) {
    addToChat = function () { };
    showNotification = function () { };
    setTimeout(() => { connection.close(); }, 1000);
    setTimeout(() => { ipcRenderer.sendSync('close_app'); }, 1000);
});

$("#minimize").click(function (e) {
    ipcRenderer.sendSync('minimize_app');
});

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

var sendMessage = function (text) {
    if (!connected && text === "") { return; }
    let message = {};
    message["text"] = text;
    connection.send(JSON.stringify(message));
};

function processResponse(rawdata) {
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
        response.message = weightedRandom(response.beam_texts);

    console.log('message:', response.message);
    console.log("beam_texts:", response.beam_texts);
    console.log("quick_reply:", response.quick_reply);

    return response;
}

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
        //Map probability to 0-1 scale.
        var prob = 0.01 / (val / sum);
        //Map linear scale to logrithmic scale
        var prob = prob * (1 / (i + 1));

        sum2 += prob;
        dict[i].probability = prob;
    }

    dict.forEach(function (item) {
        //Map probability to 0-1 scale again.
        item.probability = item.probability / sum2;
    });

    return dict;
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

var showNotification = function (text) {
    $('#notification_text').text(text);
    $('#notification').toast('show');
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