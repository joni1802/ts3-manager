import TeamSpeak from '../../api/TeamSpeak'

const state = {
  messages: []
}

const mutations = {
  saveMessage(state, message) {
    state.messages.push(message)
  },
  removeAllMessages(state) {
    state.messages = []
  }
}

// const getQueryUserInfo = () => {
//   return TeamSpeak.execute('whoami').then(list => list[0])
// }
//
// const getServerInfo = () => {
//   return TeamSpeak.execute('serverinfo').then(list => list[0])
// }
//
// const createMessage = (notification, target) => {
//   return {
//     target,
//     text: notification.msg,
//     targetmode: notification.targetmode,
//     sender: notification.invoker.client_nickname,
//     timestamp: new Date()
//   }
// }
//
// const actions = {
//   async handleNotification({commit}, notification) {
//     let target = undefined
//
//     switch(notification.targetmode) {
//       case 1:
//         target = notification.invoker.clid
//
//         break;
//       case 2:
//         let queryUser = await getQueryUserInfo()
//
//         target = queryUser.client_channel_id
//
//         break;
//       case 3:
//         let serverInfo = await getServerInfo()
//
//         target = serverInfo.virtualserver_id
//     }
//
//     commit('saveMessage', createMessage(notification, target))
//   }
// }

export default {
  state,
  mutations,
  // actions
}
