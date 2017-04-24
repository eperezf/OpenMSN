const ipcRenderer = require('electron').ipcRenderer
const remote = require('electron').remote

function KillWindow(){
  var window = remote.getCurrentWindow();
  window.close();
}

console.log('I have loaded!')
ipcRenderer.on('addinfo', (event, email, id, nick) => {
  a_email = email
  a_id = id
  a_nick = nick
  console.log(nick + ' (' + email + ')' + 'wants to add you to his friends list!. Solicitude ID is: ' + id)
  document.getElementById('email').textContent = email;
  document.getElementById('nick').textContent = nick;
})

function AcceptFriend(){
  ipcRenderer.send('accept-contact', a_email, a_id, a_nick)
  KillWindow()
}
