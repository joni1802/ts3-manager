import Vue from "vue";

const state = {
  messages: []
};

const mutations = {
  saveMessage(state, message) {
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
          sender: notification.invoker,
          text: notification.msg,
          meta: {
            unread: true
          }
        });
      }
    } catch (err) {
      Vue.prototype.$toast.error(err.message);
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
        meta
        // timestamp: new Date()
      });
    } catch (err) {
      Vue.prototype.$toast.error(err.message);
    }
  }
};

export default {
  state,
  mutations,
  actions
};
