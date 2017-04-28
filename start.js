/* jshint esversion: 6 */

const ipcRenderer = require('electron').ipcRenderer;
const {shell} = require('electron');

function LinkRegister (){
  console.log("Opening register!");
  shell.openExternal('http://162.243.220.190/register.php');
}

function submitLData(){
  var remebox = document.getElementById("cbgroup");
  var loginbox = document.getElementById("loginanim");
  remebox.style.display = 'none';
  loginbox.style.display = 'block';
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var newi_tatus = document.getElementById("status").value;
  console.log(email);
  console.log(password);
  ipcRenderer.send('login-data', email, password, newi_tatus);

}

function CheckKey(e) {
   if(e && e.keyCode == 13) {
      submitLData();
   }
}

ipcRenderer.on('login-status', (event, arg) => {
  if (arg == 'ok') {

  }
  else if (arg == 'err'){
    var remebox = document.getElementById("cbgroup");
    var loginbox = document.getElementById("loginanim");
    remebox.style.display = 'block';
    loginbox.style.display = 'none';
  }

});

window.onresize = function(event) {
  var profilepic;
  if ((window.innerHeight < 465))  {
    profilepic = document.getElementById("profilepic");
    profilepic.style.display = 'none';
  }
  else {
    profilepic = document.getElementById("profilepic");
    profilepic.style.display = 'block';
  }
};
