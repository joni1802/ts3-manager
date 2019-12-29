# TS3 Manager backend
The backend uses the **express** framework for the webserver. Every HTTP-Request is send directly to the frontend. There is no routing in the backend.
For the websocket connection **socket.io** is used.
The communtication to the ServerQuery is handled by the [TS3-NodeJS-Library](https://multivit4min.github.io/TS3-NodeJS-Library/). The logs are created by **winston**.

## Project setup
```
cd /to/project/folder/backend/
npm install
```

### Hot-reload for development
```
npm install nodemon -g
```

### Start server
```
npm run dev
```


## Generate executables
The package **pkg** from **zeit** is used for creating 3 executables (Mac, Windows and Linux). You have to install pkg first for using it.
```
npm install pkg -g
```
The following will generate the executables:
```
pkg .
```
It uses the **bin** and **pkg** properties inside the package.json to create the executables.
Sadly right now when you are creating the packages on a windows system the generated executables for mac and linux are not working. The executables for linux and mac need to be created on a mac or linux machine.
