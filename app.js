//Declare Electron
const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')
//Declare XMPP
var Client = require('node-xmpp-client')
//Declare path and url
const path = require('path')
const url = require('url')
//Declare Screens
//Start screen (login)
let start
//Main screen (contacts and options)
let main
//??
let user
//Contact solicitude screen
let added = []
//Configuration screen
let config
//Add contact screen
let add
//Chat screens
let chat = []
//Declare user variables
//User status (Can be user defined)
var status
//Internal status (Not user defined. For server purposes.)
var i_status
//Logged in?
loggedIn = false
//User JID (email)
var jid
//User nickname
var nickname
//Contacts I can see
var contact = []
//Contact I added but I'm waiting for their approval
var  waiting = []
//Contacts that added me but I haven't accepted yet.
var requests = []
//ingnored requests
var ignored = []
//Blocked list
var blocked = []

//Start of code

//When the app is ready to be shown
app.on('ready', function() {
  OpenStart()
})

//Keep alive the connection by sending an empty message periodically
function KeepAlive(){
  setInterval(function() {
    user.send(' ');

  }, 30000);
}

/*
1.- OpenStart(): The Start screen (login and password)
2.- OpenMain(): Nickname, status, personal message, contact list and menus.
3.- OpenAdded(from, id, nick): Added choice dialog
*/

//1.- The Start screen (login and password input)
function OpenStart(){
  if (start != null){
    console.log("There's already a start screen open.");
    start.focus()
  }
  else {
    start = new BrowserWindow ({
      width:290,
      height:496,
      show:false,
    })
    start.loadURL('file://' + __dirname + '/start.html')
    start.once('ready-to-show', () => {
      start.show()
      console.log("!!!!Start screen has been created!!!!");
    })
  }
  start.on('closed', () => {
    console.log("!!!!Start screen has been closed!!!!");
    start = null
  })
}


//2.- Main screen: Nickname, status, personal message, contact list and menus.
function OpenMain(){
  if (main != null){
    console.log("!!!!There's already a main screen open!!!!");
    main.focus()
  }
  else {
    main = new BrowserWindow ({
      width:287,
      height:512,
      minWidth:287,
      minHeight:512,
      show: false
    })
    main.loadURL('file://' + __dirname + '/main.html')
    main.once('ready-to-show', () => {
      main.show()
      console.log("!!!!Main screen has been created!!!!");
      InfoFill();
    })
  }
  main.on('closed', () => {
    console.log("!!!!Main Screen has been closed!!!!");
    main = null
  })
}



//4.- Config screen: Configuration and settings
function OpenConfig(){
  if (config != null){
    console.log("!!!!There's already a config screen open!!!!");
    config.focus()
  }
  else {
    config = new BrowserWindow ({
      width:500,
      height:500,
      show:false,
    })
    config.loadURL('file://' + __dirname + '/config.html')
    config.once('ready-to-show', () => {
      console.log("Config screen has been opened.");
      config.webContents.send('config-data', {nickname: nickname, pmessage: 'PLACEHOLDER'})
      config.show()
    })
  }
  config.on('closed', () => {
    console.log("!!!!Config screen has been closed!!!!");
    config = null
  })
}

ipcMain.on('open-chat', (event, email) => {
  OpenChat(email)
  chat[email].focus()
})

function OpenChat(email, focus){
  if (chat[email] != null){
    console.log("!!!!There's already a chat screen for " + email + "!!!!");
  }
  else {
    chat[email] = new BrowserWindow ({
      width:650,
      height:500,
      show:false,
      minWidth:650,
      minHeight:500,
      title: contact[email].nickname + " - Conversation"
    })
    chat[email].loadURL('file://' + __dirname + '/chat.html')
    chat[email].once('ready-to-show', () => {
      chat[email].show()
      console.log("!!!!Opened chat screen for " + email + "!!!!");
      chat[email].webContents.send('contact-info', {email: email, nickname: contact[email].nickname, status: contact[email].status, i_status: contact[email].i_status, own_nickname: nickname })
    })
  }
  chat[email].on('closed', () => {
    chat[email] = null
    index = chat.indexOf(email)
    console.log("!!!!Closed chat screen for " + email + "!!!!");
    if (index > -1) {
      chat.splice(index, 1);
    }
  })
}






/*
System message reception from renderer to main process:
1.- login-data: When the login data from the logon screen is received
2.- status-change: When there's a status change solicitude from the renderer.
3.- accept-friend: When a contact approval is sent from the renderer.
4.- open-config: When there's a solicitude from the renderer to open the configuration panel.
5.- nickname-change: WHen there's a nickname change solicitude from the renderer.
*/

//1.- login-data: When the login data from the logon screen is received
ipcMain.on ('login-data', (event, newjid, password, newi_status) => {
  jid = newjid
  i_status = newi_status
  LoginUser(jid, password)
  user.on('online', function() {
    event.sender.send('login-status', 'ok')
    OpenMain()
    start.close()
    AskRoster();
    SendCaps();
    ListenStanzas()
    SetStatus(i_status);
    loggedIn = true



  })
  user.on('error', function (e) {
  console.error(e)
  dialog.showErrorBox('Login error', 'There was an error logging in. Please check if your email and/or password are correct.')
  event.sender.send('login-status', 'err')
})
})

//4.- open-config: When there's a solicitude from the renderer to open the configuration panel. TODO: the default tab opened in the solicitude.
ipcMain.on('open-config', (event, defaulttab) => {
  OpenConfig()
})

//5.- nickname-change: When there's a nickname change solicitude from the renderer.
ipcMain.on('nickname-change', (event, newnickname) => {
  SetNickname(newnickname, jid)
})

//Keep alive the connection
function KeepAlive(){
  setInterval(function() {
    user.send(' ');

  }, 30000);
}

function ListenStanzas(){

  user.on('stanza', function(stanza) {
    //A stanza is received!!
    if (stanza.is('message')){
      //The stanza is a message
      if (stanza.attrs.type === 'chat'){
        //The stanza is a chat!
        if (stanza.getChild('composing') !== undefined){
          //The stanza is a "typing..." type
        }
        else if (stanza.getChild('paused') !== undefined){
          //The stanza is a "paused..." type
        }
        else {
          //It's a text message.
          if (stanza.getChildText('body') === null){
            console.log(stanza.tree().toString())

          }
          else {
            console.log(stanza.getChildText('body'))
            MessageReceived(stanza.attrs.from, stanza.getChildText('body'))
          }

        }
      }
      else if (stanza.attrs.type === 'headline'){
        if (stanza.getChild('event').getChild('items').attrs.node == "http://jabber.org/protocol/nick"){
          var cnewnick = stanza.getChild('event').getChild('items').getChild('item').getChildText('nick')
          if (stanza.attrs.from != jid){
            UpdateContact(stanza.attrs.from, "nickname", cnewnick)
          }
        }
      }
      else {
        console.log(">>>>Unknown Message received. Logging<<<<");
        console.log(stanza.tree().toString());
      }
    }
    else if (stanza.is('iq')){
      if (stanza.attrs.type == 'result'){
        if (stanza.getChild('query')){
          if (stanza.getChild('query').attrs.xmlns == 'jabber:iq:roster'){
            console.log("Roster list received.");
            RosterPopulate(stanza)
          }
        }
        else {
          console.log(stanza.tree().toString())
        }
      }
      else if (stanza.attrs.type == 'set') {
        if (stanza.getChild('query').attrs.xmlns == 'jabber:iq:roster'){
          console.log('Roster Set acknowledged.');
        }
      }
      else if (stanza.attrs.type == 'get'){
        console.log(">>>>Get type IQ received<<<<");
        console.log(stanza.tree().toString());
        SendFeatures(stanza.attrs.id);

      }
    }
    else if (stanza.is('presence')){
      if (stanza.attrs.from != stanza.attrs.to){
        if (stanza.attrs.type == 'subscribe' || stanza.attrs.type == 'subscribed'){
          console.log("Presence subscribe/subscribed stanza received");
          ContactFunction(stanza.attrs.from, stanza.getChildText('nick'), stanza.attrs.type);
        }
        else {
          if (stanza.getChild('show')){
            sfrom = stanza.attrs.from
            sfrom = sfrom.substring(0, sfrom.indexOf('/'));
            sstatus = stanza.getChildText('status')
            sshow = stanza.getChildText('show')
            console.log("Presence received: " + sfrom + " is now " + sstatus + " (" + sshow + ")")
            UpdateContact(sfrom, 'i_status', sshow)
            UpdateContact(sfrom, 'status', sstatus)
          }
          else {
            if (stanza.getChild('status')){
              sfrom = stanza.attrs.from
              sfrom = sfrom.substring(0, sfrom.indexOf('/'));
              sstatus = stanza.getChildText('status')
              sshow = 'available'
              console.log("Presence received: " + sfrom + " is now " + sstatus + " (" + sshow + ")")
              UpdateContact(sfrom, 'i_status', sshow)
              UpdateContact(sfrom, 'status', sstatus)
            }
            else {
              if (stanza.getChild('c')){
                console.log(">>>>Capabilities received<<<<");
                console.log(stanza.tree().toString());
              }
              else {
                sfrom = stanza.attrs.from
                sfrom = sfrom.substring(0, sfrom.indexOf('/'));
                sstatus = 'Offline'
                sshow = 'unavailable'
                console.log("Presence received: " + sfrom + " is now " + sstatus + " (" + sshow + ")")
                UpdateContact(sfrom, 'i_status', sshow)
                UpdateContact(sfrom, 'status', sstatus)
              }
            }
          }
        }
      }
      else {
        console.log("Own presence acknowledged.");
      }
    }
    else {
      //I don't know what the fuck did I get
      console.log(stanza.tree().toString())
    }
  })
}

//Get user's Roster (WIP)
function AskRoster(){
  var stanza = new Client.Stanza('iq', {id:'RosterGet', type:'get'})
  .c('query', {xmlns: 'jabber:iq:roster'})
  user.send(stanza)
  console.log("<<<<Roster request sent>>>>");
}

function SendCaps(){
  var stanza = new Client.Stanza('presence', {from: jid})
    .c('c', {xmlns: 'http://jabber.org/protocol/caps', node: 'OpenMSN 0.1.1', ver: 'a851fa35562402d48e7512d6f8b0063fb149e035'})

  console.log("<<<<Sending cap presence>>>>");
  console.log(stanza.tree().toString());
  user.send(stanza)
}

function SendFeatures(id){
  console.log("<<<<Sending features>>>>");
  var stanza = new Client.Stanza('iq', {from: jid, to:"localhost", type: "result", id: id})
    .c('query', {xmlns: "http://jabber.org/protocol/disco#info"})
      .c('identity', {category: "client", type: "pc" }).up()
      .c('feature', {var:'http://jabber.org/protocol/activity'}).up()
      .c('feature', {var:'http://jabber.org/protocol/muc'}).up()
      .c('feature', {var:'http://jabber.org/protocol/tune'}).up()
      .c('feature', {var:'http://jabber.org/protocol/tune+notify'}).up()
      .c('feature', {var:'http://jabber.org/protocol/nick'}).up()
      .c('feature', {var:'http://jabber.org/protocol/nick+notify'}).up()
  console.log(stanza.tree().toString());
  user.send(stanza);
}

function RosterPopulate(stanza){
  stanza.getChild('query').getChildren('item').forEach(function(element) {
    var rjid = element.attrs.jid
    var rsub = element.attrs.subscription
    var rnick = element.attrs.name
    if (rjid == jid){
      nickname = rnick
      console.log("Saved Nickname from last login: " + rnick);
      main.webContents.send('nickname-change', {nickname: nickname})
    }
    else {
      if (rsub == undefined){
        waiting.push(rjid);
      }
      else if (rsub == "both"){
        InsertContact(rjid, rnick, rsub);
      }
    }
  });
}



//Do the login
function LoginUser (loginjid, password){
  user = new Client({
    host: '162.243.220.190',
    jid: loginjid,
    password: password,
    preferred: 'PLAIN'
  })
}


/*
STATUS section
*/
function SetStatus(newi_status) {
  SendCaps();
  i_status = newi_status;
  if (newi_status == 'available'){
    var server_status = 'available'
    status = 'Online'
    i_status = newi_status;
  }
  else if (newi_status == 'dnd'){
    var server_status = 'dnd'
    status = 'Busy'
    i_status = newi_status;
  }
  else if (newi_status == 'away-brb'){
    var server_status = 'away'
    status = 'Be Right Back'
    i_status = newi_status;
  }
  else if (newi_status == 'away'){
    var server_status = 'away'
    status = 'Away'
    i_status = newi_status;
  }
  else if (newi_status == 'dnd-otp'){
    var server_status = 'dnd'
    status = 'On The Phone'
    i_status = newi_status;
  }
  else if (newi_status == 'away-otl'){
    var server_status = 'away'
    status = 'Out To Lunch'
    i_status = newi_status;
  }

  if (newi_status == 'available'){
    status = 'Online'
    i_status = 'available'
    stanza = new Client.Stanza('presence', { })
      .c('status').t(status)
  }
  else {
    stanza = new Client.Stanza('presence', { })
      .c('show').t(server_status).up()
      .c('status').t(status)

  }
  user.send(stanza)
  console.log(stanza.tree().toString())
  console.log("New status: " + status + " (" + i_status + ")");
  main.webContents.send('status-change', {status: status, i_status: i_status});
}

ipcMain.on ('status-change', (event, newi_status) => {
  i_status = newi_status
  SetStatus(i_status);
})



//Sets the nickname WIP
function SetNickname(newnickname, username){
  //check if it's the same as the old one!
  if (newnickname != nickname){
    nickname = newnickname

    //Nickname set 1
    stanza = new Client.Stanza('iq', {type:'set', id:'RosterSet-Nick'})
      .c('query', {xmlns: 'jabber:iq:roster'})
        .c('item', {jid: username, name: nickname})
    user.send(stanza)
    console.log(stanza.tree().toString());

    //Nickname set 2 (PEP)
    stanza = new Client.Stanza('iq', {from: jid, type: 'set', id: "pub1"})
      .c('pubsub', {xmlns:'http://jabber.org/protocol/pubsub'})
        .c('publish', {node:'http://jabber.org/protocol/nick'})
          .c('item')
            .c('nick', {xmlns: "http://jabber.org/protocol/nick"}).t(nickname)
    user.send(stanza)
    console.log(stanza.tree().toString());

    console.log("Nickname changed to " + nickname);
    main.webContents.send('nickname-change', {nickname: nickname});
  }
  else {
    console.log("Nickname is the same as the old one. Not changing.");
  }

}

/*
Messaging section
*/

ipcMain.on('send-message', (event, email, message) => {
  SendMessage(email, message)
})

//Send a message
function SendMessage(contact, body){
  var stanza = new Client.Stanza('message', {to: contact, type: 'chat',id:'MessageSent'})
  .c('body').t(body)
  user.send(stanza);
  KeepAlive();
  console.log("Message to " + contact + ": " + body);
}

function MessageReceived(email, message){
  email = email.substring(0, email.indexOf('/'));
  console.log("Message from " + email + ": " + message);
  main.webContents.send('message-received');
  if (chat[email]){
    chat[email].webContents.send('message-received', {message: message})
  }
  else {
    OpenChat(email, "unfocused")
    chat[email].once('ready-to-show', () => {
      chat[email].webContents.send('message-received', {message: message})
    })
    chat[email].blur()
  }
  if (process.platform == "darwin"){
    app.dock.bounce('informational')
  }
}


function InfoLog(type, code, text){
  console.log('════════════════════════');
  if (!text){
    console.log(type + "-" + code)
  }
  else {
    console.log(type + "-" + code + ": " + text)
  }
}

function InfoFill(){
  console.log("════INFO FILL PROCESS════")

  main.webContents.send('status-change', {status: status, i_status: i_status})
  main.webContents.send('nickname-change', {nickname: nickname})
  for (var key in contact) {
    console.log("Filling: " + key + " is " + contact[key].status + " (" + contact[key].i_status + ")")
  	c_email = contact[key].email
  	c_nickname = contact[key].nickname
  	c_i_status = contact[key].i_status
    c_status = contact[key].status
  	c_subscription = contact[key].subscription
    main.webContents.send('insert-contact', {email: c_email, nickname: c_nickname, i_status: c_i_status, status: c_status, subscription: c_subscription})
  }
  console.log("════END INFO FILL PROCESS════")
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    user.end()
  }
})
app.on('activate', () => {
  if (start === null) {
    if (loggedIn){
      OpenMain()
    }
    else {
      OpenStart()
    }
  }
})

/*
Contacts systems:

USES:
  added.js
  add.js

Functions:
OpenAdded(email, id, nick)
  Description: Opens the "X has added you".
  Variables:
    email: (string) the email of the person who added you
    id: (string) the id of the subscription stanza. Not used yet
    nick: (string) the nickname of the person

OpenAdd()
  Description: Opens the adding form
  Variables:
    none

ContactFunction(email, nick, action)
  Description: Decides what to do according to the different lists.
    Variables:
      email: (string) the email of the person
      nick: (string) the nickname of the person
      action: (string) subscribe if you want to add the person to the contact list, subscribed if you want to accept the person's subscribe request.

AcceptContact(email)
  Description: Accepts the contact. He will pass from the "requests" queue and will add him back if you don't have him
  Variables:
    email: (string) the email of the person you're accepting

AddContact(email)
  Description: Adds the contact to the "waiting" list
  Variables:
    email: (string) the email of the person you're adding
*/

function OpenAdded(email, id, nick){
  added.push(email);
  added[email] = new BrowserWindow ({
    width:550,
    height:160,
    show:false,
    resizable:false
  })
  added[email].loadURL('file://' + __dirname + '/added.html')
  added[email].once('ready-to-show', () => {
    added[email].show()
    added[email].webContents.send('addinfo', email, id, nick)
  })
  added[email].on('closed', () => {
    added[email] = null
    index = added.indexOf(email)
    if (index > -1) {
      added.splice(index, 1);
    }
  })
}

function OpenAdd(){
  if (add != null){
    console.log("There's already an add screen open");
    add.focus()
  }
  else {
    add = new BrowserWindow ({
      width: 500,
      height: 300,
      resizable: false,
      show: false
    })
    add.loadURL('file://' + __dirname + '/add.html')
    add.once('ready-to-show', () => {
      add.show()
      console.log("Add screen has been created");
    })
  }
  add.on('closed', () => {
    console.log("Add screen has been closed.");
    add = null
  })
}

function ContactFunction(email, nick, action){
  if (action == "subscribe"){
    if (contact[email] != undefined){
      AcceptContact(email, nick);
    }
    else{
      if (blocked.indexOf(email) != -1){
        console.log(email + " is blocked. the request will be ignored.");
        ignored.push(email);
      }
      else {
        requests.push(email);
        OpenAdded(email, "83Fjr39", nick)
      }
    }
  }
  else if (action == "subscribed") {
    index = waiting.indexOf(email)
    waiting.splice(index, 1);
    InsertContact(email, nick, 'both');

  }
}

function AcceptContact(email, id, nick){
  var stanza = new Client.Stanza('presence', {type:'subscribed', from: jid, to: email})
  user.send(stanza)
  var stanza = new Client.Stanza('iq', {type: 'set', id: 'nicksave'})
    .c('query', {xmlns: 'jabber:iq:roster'})
      .c('item', {jid: email, name: nick})
  user.send(stanza)
  index = requests.indexOf(email)
  requests.splice(index, 1);
  if (contact[email] == undefined){
    AddContact(email);

  }
}

function InsertContact(c_jid, c_nickname, c_subscription){
  var contactvars = {email: c_jid, nickname : c_nickname, i_status: 'unavailable', status: 'Offline', subscription: c_subscription};
  contact[c_jid] = contactvars;
  main.webContents.send('insert-contact', {email: contact[c_jid].email, nickname: contact[c_jid].nickname, i_status: contact[c_jid].i_status, status: contact[c_jid].status, subscription: contact[c_jid].subscription})
}

function UpdateContact(email, item, value){
  if (item == 'i_status'){
    contact[email].i_status = value;
    main.webContents.send('contact-i_status-change', {from: email, i_status: value})
  }
  if (item == 'status'){
    contact[email].status = value;
    main.webContents.send('contact-status-change', {from: email, status: value})
  }
  if (item == 'nickname'){
    stanza = new Client.Stanza('iq', {type:'set', id:'RosterSet-Nick'})
      .c('query', {xmlns: 'jabber:iq:roster'})
        .c('item', {jid: email, name: value})
    user.send(stanza)
    contact[email].nickname = value
    main.webContents.send('contact-nickname-change', {email: email, nickname: value});
  }
}

function AddContact(email){
  var stanza = new Client.Stanza('presence', {id: 'AddContact', type:'subscribe', from: jid, to: email})
    .c('nick', {xmlns:'http://jabber.org/protocol/nick'})
      .t(nickname)
  user.send(stanza);
  waiting.push(email);
}

ipcMain.on('accept-contact', (event, email, id, nick) => {
  AcceptContact(email, id, nick)
})

ipcMain.on('open-add', (event) => {
  OpenAdd()
})

ipcMain.on('add-contact', (event, email) => {
  AddContact(email)
})
