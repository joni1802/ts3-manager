import Vue from "vue";

const state = {
  messages: []
};

const getters = {
  unreadMessages: (state, _getters, rootState) => {
    return state.messages.filter(message => {
      return (
        message.meta.unread && message.serverId === rootState.query.serverId
      );
    }).length;
  }
};

const mutations = {
  saveMessage(state, message) {
    // Only the last 50 messages are stored
    if (state.messages.length > 50) state.messages.shift();

    state.messages.push(message);
  },
  markMessageAsRead(state, {target, targetmode}) {
    for (let i = 0; i < state.messages.length; i++) {
      if (
        state.messages[i].target === target &&
        state.messages[i].targetmode === targetmode
      ) {
        state.messages[i].meta.unread = false;
      }
    }
  },
  removeAllMessages(state) {
    state.messages = [];
  }
};

const actions = {
  async handleReceivedMessages({dispatch, rootState}, notification) {
    try {
      if (notification.invoker.clid !== rootState.query.queryUser.client_id) {
        dispatch("saveTextMessage", {
          targetmode: notification.targetmode,
          sender: {
            clid: notification.invoker.clid,
            client_nickname: notification.invoker.client_nickname
          },
          text: notification.msg,
          meta: {
            unread: true
          }
        });
      }
    } catch (err) {
      Vue.prototype.$toasted.error(err.message);
    }
  },
  async saveTextMessage(
    {commit, rootState},
    {targetmode, sender, text, target, meta}
  ) {
    try {
      if (!target) {
        switch (targetmode) {
          case 1:
            target = sender.clid;

            break;
          case 2:
            target = rootState.query.queryUser.client_channel_id;

            break;
          case 3:
            target = rootState.query.serverId;
        }
      }

      meta.timestamp = new Date();

      commit("saveMessage", {
        sender,
        target,
        targetmode,
        text,
        meta,
        serverId: rootState.query.serverId
      });
    } catch (err) {
      Vue.prototype.$toasted.error(err.message);
    }
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
