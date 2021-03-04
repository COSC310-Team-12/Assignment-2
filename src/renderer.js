// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let $ = jQuery = require('jquery');
const {ipcRenderer} = require('electron')
const connection = new WebSocket('ws://51.141.164.131:10001/websocket');

connection.onopen = () => {
    console.log('connected');
};

connection.onclose = () => {
    console.error('disconnected');
};

connection.onerror = error => {
    console.error('failed to connect', error);
};

connection.onmessage = event => {
    console.log('received', event.data);
    addToChat(JSON.parse(event.data)["text"], 'left');
};

$("#close").click(function(e) {
    ipcRenderer.sendSync('close_app');
});

$("#minimize").click(function(e) {
    ipcRenderer.sendSync('minimize_app');
});

var Message = function(arg) {
    this.text = arg.text, this.message_side = arg.message_side;
    this.draw = function(_this) {
        return function() {
            var $message;
            $message = $($('.message_template').clone().html());
            $message.addClass(_this.message_side).find('.text').html(_this.text);
            $('.messages').append($message);
            return setTimeout(function() {
                return $message.addClass('appeared');
            }, 0);
        };
    }(this);
    return this;
};

var sendMessage = function(text) {
    if (text === "") {return;}
    let message = {};
    message["text"] = text;
    connection.send(JSON.stringify(message));
};

var addToChat = function(text, message_side) {
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


var getMessageText, message_side;
message_side = 'right';
getMessageText = function() {
    var $message_input;
    $message_input = $('.message_input');
    return $message_input.val();
};

$('.send_message').click(function(e) {
    sendMessage(getMessageText())
    return addToChat(getMessageText(), 'right');
});
$('.message_input').keyup(function(e) {
    if (e.which === 13) {
        sendMessage(getMessageText())
        return addToChat(getMessageText(), 'right');
    }
});