const ipcRenderer = require('electron').ipcRenderer
var message
var nickname
var email
var own_nickname

ipcRenderer.on('contact-info', (event, arg) =>{
  console.log("Got contact info!");
  nickname = arg.nickname
  email = arg.email
  own_nickname = arg.own_nickname;
  document.getElementById('nickname').textContent = nickname;
  document.getElementById('email').textContent = email;
})

function SetMessage (input){
  message = input.trim()
  if (message == ""){
    console.log("Empty message");
    chatarea.value = ""

  }
  else {
    console.log("Message is: " + message);
    AppendChat(message, own_nickname);
    ipcRenderer.send('send-message', email, message)
    chatarea.value = ""
    message = ""
  }
}

ipcRenderer.on('message-received', (event, arg)=> {
  console.log("New message: " + arg.message)
  AppendChat(arg.message, nickname)
})

function AppendChat(input, who){
  var chat = document.createElement("ul");
  chat.className = "chat-line";
  var person = document.createTextNode(who + " wrote:")
  chat.appendChild(person)
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
    ':-)' : 'smile.png',
    ':)'  : 'smile.png',
    ':D'  : 'grin.png',
    ':-D' : 'grin.png',
    ':d'  : 'grin.png',
    ':-d' : 'grin.png',
    ';)'  : 'wink.gif',
    ';-)' : 'wink.gif',
    ":'(" : 'crying.gif',
    ':O'  : 'surprised.png',
    ':o'  : 'surprised.png',
    ':-O' : 'surprised.png',
    ':-o' : 'surprised.png',
    ':p'  : 'tonguesmile.png',
    ':P'  : 'tonguesmile.png',
    ':-p' : 'tonguesmile.png',
    ':-P' : 'tonguesmile.png',
    '(h)' : 'cool.png',
    '(H)' : 'cool.png',
    ':@'  : 'angry.png',
    ':$'  : 'shy.png',
    '(SO)' : 'soccer.png',
    '(so)' : 'soccer.png',
    ':s'  : 'confused.png',
    ':S'  : 'confused.png',
    ':('  : 'sad.png',
    ':-(' : 'sad.png',
    ':|'  : 'disappointed.png',
    ':-|' : 'disappointed.png',
    '(6)' : 'devil.png',
    '(a)' : 'angel.png',
    '(A)' : 'angel.png',
    '(l)' : 'heart.png',
    '(L)' : 'heart.png',
    '(m)' : 'msnmsgr.png',
    '(M)' : 'msnmsgr.png'

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
