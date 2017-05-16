# OpenMSN v0.1.11-alpha

#### Project

The idea of the project is to recreate the old, missed and famous MSN Messenger 7.5 and make it compatible with the most popular desktop operative systems.

Why version 7.5? That's the last version that was named MSN Messenger and not Windows Live Messenger. That change was not very good (at least in my opinion) and I remember better the light blue 7.5 version with nudges, winks and custom emoticons.

#### Implementation

My programming background is mostly PHP, HTML and CSS. Having no actual software programming experience, I found Electron, a frameworks that transforms web markdown and Javascript (along with Node.js) into a multiplatform app.

The system uses node-xmpp, an XMPP protocol implementation in Node. I have a DigitalOcean server (the most basic one) running ejabberd to sever all the communication systems.

#### Progress

Almost all basic functions are available:

* Chat between two users only
* Add and accept contact requests
* Almost every emoticon either on nickname or Chat
* Nickname and standard status changes
* Old classic design with all its perks and quirks.

#### To-Do

* Profile picture system
* Personal Message
* Away or Not Available notification on chat Message
* Nudges
* Winks (they were quite annoying. Not sure to implement them)
* "What are you listening" implementation (Spotify/Windows Music/iTunes APIs?)
* File sending (might not implement this due to limited server power)
* Videochat (Not implementing this due to limited server power. Unless I can use Pied Piper's compression algorithm)

### DISCLAIMER

This project is purely as training and to learn how to use Electron and Node.JS. Although it's open source, probably you'll find that the code is horribly made and you'll want to change things. Feel free to do a pull request and suggest changes but I may or may not merge them.

I managed to decompile most of the old 7.5 version of MSN Messenger and use image assets (borders, default images, icons, etc.). These assets are property of Microsoft and/or its respective owners. If by any chance Microsoft sees this and want their images removed, I have no problem at all and will do ASAP.
