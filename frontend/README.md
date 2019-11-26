# TS3 Manager frontend
It is written in Vue.js with the Vue CLI. So before you are writting code, you have to install the Vue CLI on your system. Check out the official documentation of the Vue CLI for more informations.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## Get started
### Websocket connection
At first the backend needs to be started. The URL to the backend can be modified in the __env.development__ file, e.g. if your are using a different port.

### UI Framework
Vuetify is used as material design UI Library. Right now the version 1.5 is used. For more informations go to [https://v15.vuetifyjs.com/en/](https://v15.vuetifyjs.com/en/).

### Adding a new page
If you want to add a new page, you have to create a new Vue file inside the __/components/__ directory and add the route inside __/router/routes.js__.

### Send data to the ServerQuery
In every component you have access to the query function by using ```this.$query```. The function follows the general syntax of:
```javascript
query(command = String, parameters = Object, options = Array)
```
*You have to use Async/Await or Promises to get the data.*
#### Examples
```javascript
// get serverlist
async getServers() {
  try {
    let servers = await this.$query('serverlist')
  } catch(err) {
    console.log(err)
  }
}
```
```javascript
// get clientlist
async getClients() {
  try {
    let clients = await this.$query('clientlist', {}, ['-uid', '-away'])
  } catch(err) {
    console.log(err)
  }
}
```
```javascript
// find client
async findClient() {
  try {
    let client = await this.$query('clientdbfind', {
      pattern: 'FPMPSC6MXqXq751dX7BKV0JniSo='
    }, ['-uid'])
  } catch(err) {
    console.log(err)
  }
}
```
```javascript
// send text message
async sendMessage() {
  try {
    await this.$query('sendtextmessage', {
      targetmode: 2,
      target: 2,
      msg: 'Hello buddy'
    })
  } catch(err) {
    console.log(err)
  }
}
```
