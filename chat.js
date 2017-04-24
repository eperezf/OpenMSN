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
  text.className = "chat-text";
  var msg = document.createTextNode(input);
  chat.appendChild(text);
  text.appendChild(msg);

  var element = document.getElementById("historybox");
  element.appendChild(chat);

  element.scrollTop = element.scrollHeight;
}
