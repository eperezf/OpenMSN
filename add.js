/* jshint esversion: 6 */

const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

function AddContact(){
  var jid = document.getElementById("jid").value;
  ipcRenderer.send('add-contact', jid);
  KillWindow();
}

function KillWindow(){
  var window = remote.getCurrentWindow();
  window.close();
}
