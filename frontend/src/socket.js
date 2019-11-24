import io from 'socket.io-client'
import Vue from 'vue'
import store from './store'
import router from './router'

// Socket connection to the backend
const socket = io(process.env.VUE_APP_WEBSOCKET_URI, {
  autoConnect: false,
  query: {
    token: store.state.connection.token
  }
})

// Clears the local storage and goes to the login page
const logout = () => {
  store.dispatch('clearConnection')

  router.push({name: 'login'})
}

// When a connection error occurs logout and redirect to login page
const handleSocketError = err => {
  Vue.prototype.$toast.error(err.message, {
    timeout: 0,
    dismissable: false,
    queueable: true, // toast is not getting overwritten
    icon: 'error_outline'
  })

  logout()
}

const handleTeamSpeakError = message => {
  Vue.prototype.$toast.error(message)

  logout()
}

// Register socket.io events
socket.on('reconnect', () => {
  Vue.prototype.$toast.clearQueue()

  let currentToast = Vue.prototype.$toast.getCmp()

  if(currentToast) currentToast.close() // Removes the error toast
})

socket.on('disconnect', logout)

socket.on('error', handleSocketError)
socket.on('connect_error', handleSocketError)

socket.on('TeamSpeak connection error', handleTeamSpeakError)
socket.on('TeamSpeak authentication error', handleTeamSpeakError)
socket.on('TeamSpeak connection closed', logout)

export default socket
