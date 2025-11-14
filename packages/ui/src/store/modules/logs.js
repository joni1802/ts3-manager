import TeamSpeak from "@/api/TeamSpeak";
import Vue from "vue";
import localForage, { setItem } from "localforage";

const db = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: "cache",
  storeName: "logs",
});

const state = {
  logView: [],
  fileSize: 0,
  lastPosition: undefined,
};

const mutations = {
  addLogView(state, logView) {
    state.logView.push(...logView);
  },
  setLogView(state, data) {
    state.logView = data;
  },
  setLastPosition(state, position) {
    state.lastPosition = position;
  },
};

const getLocaleDate = (timestamp) => {
  let localeDate = new Date(timestamp);
  let milliseconds =
    localeDate.getTime() + -localeDate.getTimezoneOffset() * 60 * 1000;

  localeDate.setTime(milliseconds);

  return localeDate;
};

const getParsedLogs = (logs) => {
  return logs.map(({ l }) => {
    let [timestamp, level, channel, sid, ...msg] = l.split("|");

    return {
      timestamp: getLocaleDate(timestamp),
      level: level.trim(),
      channel: channel.trim(),
      sid: parseInt(sid),
      msg: msg.join("|"),
    };
  });
};

const saveLogView = async (logView) => {
  for (let line of logView) {
    await db.setItem(line.timestamp.getTime().toString(), line);
  }
};

const actions = {
  // async syncLogViewState({ commit }) {
  //   console.log("start");

  //   let keys = await db.keys();
  //   let arr = [];

  //   // IndexedDB data is saved from oldest to newest
  //   for (let key of keys.reverse()) {
  //     // Local Forage getItem is to slow
  //     arr.push(db.getItem(key));
  //   }

  //   // This is faster
  //   let res = await Promise.all(arr);

  //   commit("setLogView", res);

  //   console.log(state.logView);
  //   console.log("fin");
  // },

  // // Die Position der bereits geladenen logs mit den aktuellen logs vergleichen und nachträglich laden
  // async initLogView({ state, dispatch, commit }) {
  //   try {
  //     if (state.logView.length) {
  //     }

  //     let fileSize = state.logView.length ? state.logView[0].fileSize : 0;

  //     await dispatch("syncLogViewState");

  //     await dispatch("getLogView");
  //   } catch (err) {
  //     Vue.prototype.$toast.error(err.message);
  //   }
  // },

  // async saveLogView({ commit }, logView) {
  //   // commit("addLogView", logView);

  //   for (let line of logView) {
  //     await db.setItem(line.timestamp.getTime().toString(), line);
  //   }
  // },

  // async clearLogView({ commit }) {
  //   commit("setLogView", []);
  //   commit("setLastPosition", undefined);

  //   try {
  //     await db.clear();
  //   } catch (err) {
  //     Vue.prototype.$toast.error(err.message);
  //   }
  // },

  // hier noch als argument position übergeben, der den Wert 0 ersetzt
  async getLogView({ dispatch, commit, state }) {
    let stop = false;
    let lastPosition = 0;

    while (!stop) {
      let logs = await TeamSpeak.execute("logview", {
        instance: 0,
        reverse: 1,
        lines: 100,
        beginPos: lastPosition,
      });

      lastPosition = logs[0].lastPos;

      let parsedLogs = getParsedLogs(logs);

      // let index;

      // if (state.logView.length) {
      //   index = parsedLogs.findIndex(
      //     (line) =>
      //       state.logView[0].timestamp.getTime() > line.timestamp.getTime()
      //   );
      // }

      // if (index !== -1) {
      //   parsedLogs.splice(index);

      //   stop = true;
      // }

      // await dispatch("saveLogView", parsedLogs);

      await saveLogView(parsedLogs);

      if (lastPosition === 0) stop = true;
    }
  },
};

export default {
  state,
  mutations,
  actions,
};
