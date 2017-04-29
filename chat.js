/* jshint esversion: 6 */

const ipcRenderer = require('electron').ipcRenderer;
var message;
var nickname;
var email;
var own_nickname;

ipcRenderer.on('typing', (event, arg) => {
  document.getElementById("typeinfo").innerHTML = nickname + " is typing...";
  clearTimeout(reset);
})

ipcRenderer.on('paused', (event, arg) => {
  if (document.getElementById("typeinfo").textContent != ""){
    console.log("Contact stopped typing");
    document.getElementById("typeinfo").innerHTML = nickname + " stopped typing...";
    reset = setTimeout(ResetTypeInfo, 5000);
  }
});

function ResetTypeInfo(){
  document.getElementById("typeinfo").innerHTML = "";
  console.log("resetted typeinfo");
}

ipcRenderer.on('contact-info', (event, arg) =>{
  console.log("Got contact info!");
  nickname = arg.nickname;
  email = arg.email;
  own_nickname = arg.own_nickname;
  document.getElementById('nickname').textContent = nickname;
  document.getElementById('email').textContent = email;
});

function SetMessage (input){
  message = input.trim();
  if (message === ""){
    console.log("Empty message");
    chatarea.value = "";

  }
  else {
    console.log("Message is: " + message);
    AppendChat(message, own_nickname);
    ipcRenderer.send('send-message', email, message);
    chatarea.value = "";
    message = "";
    typing = false;
  }
}

ipcRenderer.on('message-received', (event, arg)=> {
  console.log("New message: " + arg.message);
  AppendChat(arg.message, nickname);
  document.getElementById("typeinfo").innerHTML = "";
});

ipcRenderer.on('nickname-change', (event, arg) => {
  console.log("Someone changed a nickname!!");
  if (arg.who == "contact"){
    console.log("It was the contact");
    nickname = arg.nickname;
    document.getElementById('nickname').textContent = nickname;
  }
  else {
    console.log("It was you!");
    own_nickname = arg.nickname;
  }
});

function AppendChat(input, who){
  var chat = document.createElement("ul");
  chat.className = "chat-line";
  var person = document.createTextNode(who + " wrote:");
  chat.appendChild(person);
  var text = document.createElement("li");
  text.innerHTML = ReplaceEmoticons(input)
  text.className = "chat-text";
  chat.appendChild(text);


  var element = document.getElementById("historybox");
  element.appendChild(chat);

  element.scrollTop = element.scrollHeight;
}

function ReplaceEmoticons(text) {
  var emoticons = {
    ':O'   : 'surprised.png',     ':o'  : 'surprised.png',    ':-O' : 'surprised.png',   ':-o' : 'surprised.png',
    ':p'   : 'tonguesmile.png',   ':P'  : 'tonguesmile.png',  ':-p' : 'tonguesmile.png', ':-P' : 'tonguesmile.png',
    ':D'   : 'grin.png',          ':-D' : 'grin.png',         ':d'  : 'grin.png',        ':-d' : 'grin.png',
    ':s'   : 'confused.png',      ':S'  : 'confused.png',     ':-s' : 'confused.png',    ':-S' : 'confused.png',
    ':-)'  : 'smile.png',         ':)'  : 'smile.png',
    ';)'   : 'wink.gif',          ';-)' : 'wink.gif',
    '(SO)' : 'soccer.png',        '(so)' : 'soccer.png',
    ':('   : 'sad.png',           ':-(' : 'sad.png',
    ':|'   : 'disappointed.png',  ':-|' : 'disappointed.png',
    '(f)'  : 'rose.png',          '(F)'  : 'rose.png',
    '(h)'  : 'cool.png',          '(H)' : 'cool.png',
    '(a)'  : 'angel.png',         '(A)' : 'angel.png',
    '(l)'  : 'heart.png',         '(L)' : 'heart.png',
    '(m)'  : 'msnmsgr.png',       '(M)' : 'msnmsgr.png',
    '(p)'  : 'camera.png',        '(P)' : 'camera.png',
    '(W)'  : 'drose.png',         '(w)' : 'drose.png',
    '(e)'  : 'envelope.png',      '(E)' : 'envelope.png',
    '(g)'  : 'gift.png',          '(G)' : 'gift.png',
    '(k)'  : 'kiss.png',          '(K)' : 'kiss.png',
    '(s)'  : 'moon.png',          '(S)' : 'moon.png',
    '(o)'  : 'clock.png',         '(O)' : 'clock.png',
    ':@'   : 'angry.png',
    ':$'   : 'shy.png',
    '(6)'  : 'devil.png',
    '(^)'  : 'cake.png',
    '(@)'  : 'cat.png',
    '(&)'  : 'dog.png',
    '(~)'  : 'movie.png',
    ":'("  : 'crying.gif',
    '(8)'  : 'music.png',
    '(*)'  : 'star.png',

  }, url = "img/msn75/emoticons/", patterns = [],
     metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

  // build a regex pattern for each defined property
  for (var i in emoticons) {
    if (emoticons.hasOwnProperty(i)){ // escape metacharacters
      patterns.push('('+i.replace(metachars, "\\$&")+')');
    }
  }
  // build the regular expression and replace
  return text.replace(new RegExp(patterns.join('|'),'g'), function (match) {
    return typeof emoticons[match] != 'undefined' ?
           '<img src="'+url+emoticons[match]+'"/>' :
           match;
  });
}


function SetTyping(){
  if (typing == false){
    ipcRenderer.send('typing', email);
    console.log("You're typing!");
    typing = true;
  }
  clearTimeout(timer);
  timer = setTimeout(StoppedTyping, 2000);

}

function StoppedTyping() {
    console.log("You stopped typing!");
    typing = false;
    ipcRenderer.send('paused', email);
}
