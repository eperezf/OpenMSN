const ipcRenderer = require('electron').ipcRenderer

ipcRenderer.on('config-data', (event, nickname, pmessage) => {
  document.getElementById("nickname").value = nickname
  document.getElementById("pmessage").value = pmessage
})

function UpdateConfig(){
  var nickname = document.getElementById("nickname").value;
  var pmessage = document.getElementById("pmessage").value;
  if (nickname == ""){
    console.error("Nickame cannot be blank!")
  }
  else {
    console.log("New nickname is: " + nickname)
    if (pmessage == ""){
      console.log('Personal message is blank. It will be set to "No Personal Message"')
      pmessage = "No Personal Message"
    }
    else {
      console.log('New Personal Message is: "' + pmessage + '"')
    }
    ipcRenderer.send('nickname-change', nickname)
  }
}
