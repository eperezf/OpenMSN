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
  document.getElementById('nickname').innerHTML = ReplaceEmoticons(nickname);
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
    ':O'   : 'surprised.png',     ':o'   : 'surprised.png',    ':-O' : 'surprised.png',   ':-o' : 'surprised.png',
    ':p'   : 'tonguesmile.png',   ':P'   : 'tonguesmile.png',  ':-p' : 'tonguesmile.png', ':-P' : 'tonguesmile.png',
    ':D'   : 'grin.png',          ':-D'  : 'grin.png',         ':d'  : 'grin.png',        ':-d' : 'grin.png',
    ':s'   : 'confused.png',      ':S'   : 'confused.png',     ':-s' : 'confused.png',    ':-S' : 'confused.png',
    ':-)'  : 'smile.png',         ':)'   : 'smile.png',
    ';)'   : 'wink.gif',          ';-)'  : 'wink.gif',
    '(SO)' : 'soccer.png',        '(so)' : 'soccer.png',
    ':('   : 'sad.png',           ':-('  : 'sad.png',
    ':|'   : 'disappointed.png',  ':-|'  : 'disappointed.png',
    '(f)'  : 'rose.png',          '(F)'  : 'rose.png',
    '(h)'  : 'cool.png',          '(H)'  : 'cool.png',
    '(a)'  : 'angel.png',         '(A)'  : 'angel.png',
    '(l)'  : 'heart.png',         '(L)'  : 'heart.png',
    '(m)'  : 'msnmsgr.png',       '(M)'  : 'msnmsgr.png',
    '(p)'  : 'camera.png',        '(P)'  : 'camera.png',
    '(W)'  : 'drose.png',         '(w)'  : 'drose.png',
    '(e)'  : 'envelope.png',      '(E)'  : 'envelope.png',
    '(g)'  : 'gift.png',          '(G)'  : 'gift.png',
    '(k)'  : 'kiss.png',          '(K)'  : 'kiss.png',
    '(s)'  : 'moon.png',          '(S)'  : 'moon.png',
    '(o)'  : 'clock.png',         '(O)'  : 'clock.png',
    '(i)'  : 'light.png',         '(I)'  : 'light.png',
    '(c)'  : 'coffee.png',        '(C)'  : 'coffee.png',
    '(t)'  : 'phone.png',         '(T)'  : 'phone.png',
    '(b)'  : 'beer.png',          '(B)'  : 'beer.png',
    '(d)'  : 'cocktail.png',      '(D)'  : 'cocktail.png',
    '(z)'  : 'man.png',           '(Z)'  : 'man.png',
    '(x)'  : 'woman.png',         '(X)'  : 'woman.png',
    '(y)'  : 'yes.png',           '(Y)'  : 'yes.png',
    '(n)'  : 'no.png',            '(N)'  : 'no.png',
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
    '({)'  : 'manhug.png',
    '(})'  : 'womanhug.png',

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
