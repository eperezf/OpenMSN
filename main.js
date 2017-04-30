const ipcRenderer = require('electron').ipcRenderer

var typeAudio = new Audio (__dirname + '/wav/MSN75/type.wav');
var loginAudio = new Audio (__dirname + '/wav/MSN75/online.wav')
var nickstat
var i_status
var nickname
var status

ipcRenderer.on('message-received' , (event , arg) => {
  if (i_status == "available"){
    typeAudio.pause();
    console.log('Got a message!');
    typeAudio.play();
  }
  else {
    console.log('Got a message! (muted)');
  }
});

ipcRenderer.on('nickname-change', (event, arg) => {
  console.log('NICKNAME CHANGE: ' + arg.nickname)
  nickname = arg.nickname
  nickstat = nickname + " (" + status + ")";
  document.getElementById('nickstat').textContent = nickstat;
});

/*
Status section
*/
ipcRenderer.on('status-change', (event, arg) => {
  console.log('STATUS CHANGE: ' + arg.status + " (" + arg.i_status + ")")
  if (arg.i_status == 'available'){
    status = 'Online'
    i_status = arg.i_status;
  }
  else if (arg.i_status == 'dnd'){
    status = 'Busy'
    i_status = arg.i_status;
  }
  else if (arg.i_status == 'away-brb'){
    status = 'Be Right Back'
    i_status = arg.i_status;
  }
  else if (arg.i_status == 'away'){
    status = 'Away'
    i_status = arg.i_status;
  }
  else if (arg.i_status == 'dnd-otp'){
    status = 'On The Phone'
    i_status = arg.i_status;
  }
  else if (arg.i_status == 'away-otl'){
    status = 'Out To Lunch'
    i_status = arg.i_status;
  }
  nickstat = nickname + " ("+ status + ")";
  document.getElementById('statusselect').value="show";
  document.getElementById('nickstat').textContent = nickstat;
});

function SetStatus (selectObject) {
  var newi_status = selectObject.value;
  if (newi_status.includes("cfg")){
    openConfig()
    console.log("CONFIG SELECTION");
    nickstat = nickname + " ("+ status + ")";
    document.getElementById('statusselect').value="show";
    document.getElementById('nickstat').textContent = nickstat;
  }
  else {
    if (newi_status != i_status){
      nickstat = nickname + " ("+ status + ")";
      document.getElementById('statusselect').value="show";
      document.getElementById('nickstat').textContent = nickstat;
      ipcRenderer.send('status-change', newi_status)
    }
  }
}

/*

*/

ipcRenderer.on('contact-i_status-change', (event, arg) => {
  from = arg.from.split("/")[0];
  console.log('Contact ' + arg.from + ' changed his internal status to ' + arg.i_status)
  ci_statusChange(from, arg.i_status)
})

ipcRenderer.on('contact-status-change', (event, arg) => {
  from = arg.from.split("/")[0];
  console.log('Contact ' + arg.from + ' changed his status to ' + arg.status)
  cstatusChange(from, arg.status)
})

ipcRenderer.on('contact-nickname-change', (event, arg) => {
  document.getElementById(arg.email).getElementsByClassName("cnickname")[0].innerHTML = ReplaceEmoticons(arg.nickname)
  console.log('Contact ' + arg.from + ' changed his status to ' + arg.nickname)
})

ipcRenderer.on('insert-contact', (event, arg) =>{
  console.log("Contact info received: " + arg.email + " is " + arg.status + " (" + arg.i_status + ")")
  if (document.getElementById(arg.email) == null) {
    if (arg.nickname == undefined){
      AppendContact(arg.email, arg.email, arg.status, arg.i_status);
    }
    else {
      AppendContact(arg.nickname, arg.email, arg.status, arg.i_status);
    }
  }
})


function openConfig(defaulttab) {
  ipcRenderer.send('open-config', defaulttab)
  console.log("Opening config!")
}

function addContact(){
  ipcRenderer.send('open-add')
  console.log("Opening Add Contact form!")
}

function AppendContact(nickname, jid, status, i_status){
  console.log("appending " + jid + " i_status " + i_status);
  var onlinelist = document.getElementById('onlinelist')
  var offlinelist = document.getElementById('offlinelist')

  var contactitem = document.createElement("div")
  contactitem.setAttribute("id", jid);
  contactitem.setAttribute("ondblclick", "OpenChat('" + jid + "')")
  contactitem.classList.add("contactitem");
  contactitem.setAttribute("onclick", "clickSingleA(this)")

  var statimage = document.createElement("img")
  statimage.src = "img/msn75/"+ i_status +".png"
  statimage.classList.add("statimage");


  var cnicknameitem = document.createElement("div")
  cnicknameitem.className += "cnickname inline";
  cnicknameitem.innerHTML = ReplaceEmoticons(nickname);

  var cstatusitem = document.createElement("div")
  cstatusitem.className += "cstatus inline";
  cstatusitem.appendChild(document.createTextNode("(" + status + ")"));

  var cpmessageitem = document.createElement("div")
  cpmessageitem.className += "cpmessage inline";
  cpmessageitem.appendChild(document.createTextNode(" - Not Available"));

  contactitem.appendChild(statimage)
  contactitem.appendChild(cnicknameitem)
  contactitem.appendChild(cstatusitem)
  contactitem.appendChild(cpmessageitem)

  if (i_status == "unavailable"){
    offlinelist.appendChild(contactitem)
  }
  else {
    onlinelist.appendChild(contactitem)
  }


}

function cstatusChange(from, status){
  var cline = document.getElementById(from)
  var cnick = cline.getElementsByClassName('cstatus')[0]
  cnick.textContent = '(' + status + ')'

}

function ci_statusChange(from, i_status){
  var cline = document.getElementById(from)
  var cicon = cline.getElementsByClassName('statimage')[0]

  var cstatus = cline.getElementsByClassName('cstatus')[0]
  if (cstatus.textContent == "(Offline)"){
    if (i_status == "available"){
      document.getElementById('onlinelist').appendChild(document.getElementById(from));
      loginAudio.play();
    }
  }
  else {
    if (i_status == "unavailable"){
      document.getElementById('offlinelist').appendChild(document.getElementById(from));
    }
  }
  cicon.src = "img/msn75/" + i_status + ".png"
}

function OpenChat(email){
  ipcRenderer.send('open-chat', email)
}

function clickSingleA(a)
{
    items = document.querySelectorAll('.contactitem.cactive');

    if(items.length)
    {
        items[0].className = 'contactitem';
    }

    a.className = 'contactitem cactive';
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
