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
  cnicknameitem.appendChild(document.createTextNode(nickname));

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
