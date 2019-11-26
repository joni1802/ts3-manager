![TS3 Manager](https://www.ts3.app/ts3_manager_text_new_2.svg)

[![Download TS3 Manager](https://img.shields.io/sourceforge/dt/ts3-manager.svg)](https://sourceforge.net/projects/ts3-manager/files/latest/download)

The TS3 Manager is a webgui where you can manage your Teamspeak3 server. The web app allows to control multiple teamspeak instances in just one interface. If you just want to download and install it on your own server, please go to the [official webpage](https://www.ts3.app).

![Screenshot TS3 Manager](https://a.fsdn.com/con/app/proj/ts3-manager/screenshots/Server%20Viewer%20-blur.png/max/max/1)

## For developers
The project is split into two directories. The frontend is handling everything what the user sees. Even the routing is handled by the frontend. The backend communicates with the TeamSpeak ServerQuery and sends the responses back to the frontend. Frontend and backend are talking to each other over websockets.

### Frontend
The frontend is written in Vue.js. For more infos go to the README file inside that directory.

### Backend
The backend is written in plain NodeJS. All the nessecary information are listed in the README file there.
