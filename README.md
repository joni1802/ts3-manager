![TS3 Manager](https://www.ts3.app/ts3_manager_text_new_2.svg)

[![Download TS3 Manager](https://img.shields.io/sourceforge/dt/ts3-manager.svg)](https://sourceforge.net/projects/ts3-manager/files/latest/download)

## What is TS3 Manager 🤔
The TS3 Manager is a webinterface which allows to maintain your TeamSpeak server from everywhere over a browser. If you just want to download and install it on your own server or find out more about this project, please go to the [official webpage](https://www.ts3.app). The following documentation is addressed to developers.

![Screen Recording TS3 Manager Server Viewer](https://www.ts3.app/assets/img/ts3-manager-server-viewer.c57e8b5d.gif)

## Developement setup 🔧
The TS3 Manager is written in [NodeJS](https://nodejs.org). The latest LTS version of NodeJS including NPM needs to be installed.

### Folder structure 📁
The project is split into two directories. The frontend is handling everything what the user sees. Even the routing is handled by the frontend. The backend communicates with the TeamSpeak ServerQuery and sends the responses back to the frontend. Frontend and backend are talking to each other over websockets.

![Communication Diagram](https://www.ts3.app/assets/img/diagram-small.5f1e80e7.png)

### Frontend
The frontend is written in Vue.js using the Vue-CLI. For more infos go to the [README file](./frontend/README.md) inside that directory.

### Backend
The backend is written in plain NodeJS. All the nessecary information are listed in the [README file](./backend/README.md) there.
