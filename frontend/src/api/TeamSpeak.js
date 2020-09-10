import socket from "../socket";
import store from "../store";
import router from "../router";
import NProgress from "nprogress";
import Vue from "vue";

/**
 * The TeamSpeak Object sends the request to the server and finally receives the response from the ServerQuery.
 * To keep things simple it uses the same naming as the TeamSpeak class from the TS3-NodeJS-Library which is used on the server side.
 * See: https://multivit4min.github.io/TS3-NodeJS-Library/classes/teamspeak.html
 * @type {Object}
 */

const TeamSpeak = Object.create(new EventTarget());

const handleError = (error, resolve, reject) => {
  switch (error.id) {
    // Empty result error e.g. an empty permissionlist
    case 1281:
      resolve([]);
      break;
    default:
      reject(error);
  }
};

let handleResponse = (response, resolve, reject) => {
  // TeamSpeak Error or general Error
  if (
    (response.id && response.id !== 0) ||
    (!response.id && response.message)
  ) {
    handleError(response, resolve, reject);
  } else {
    resolve(response);
  }
};

// Just for debugging the progress bar (NProgress)
const throttleSocketConnection = time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

// Middleware that handles the progressbar
const setLoadingState = methods => {
  methods.forEach(method => {
    let next = TeamSpeak[method];
    let timer = setTimeout(() => {
      store.commit("isLoading", false);

      NProgress.done();
    }, 0);

    TeamSpeak[method] = async (...args) => {
      try {
        clearTimeout(timer);
        store.commit("isLoading", true);
        NProgress.inc();

        if (process.env.NODE_ENV === "development")
          await throttleSocketConnection(0);

        let response = await next(...args);

        timer = setTimeout(() => {
          store.commit("isLoading", false);

          NProgress.done();
        }, 0);

        return response;
      } catch (error) {
        store.commit("isLoading", false);

        NProgress.done();

        throw error;
      }
    };
  });
};

TeamSpeak.connect = params => {
  return new Promise((resolve, reject) => {
    socket.emit("teamspeak-connect", params, response => {
      if (response.token) {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

TeamSpeak.execute = (...args) => {
  let command = args[0];
  let params = args[1] ? args[1] : {};
  let options = args[2] ? args[2] : [];

  return new Promise((resolve, reject) => {
    socket.emit(
      "teamspeak-execute",
      {
        command,
        params,
        options
      },
      response => handleResponse(response, resolve, reject)
    );
  });
};

TeamSpeak.createSnapshot = () => {
  return new Promise((resolve, reject) => {
    socket.emit("teamspeak-createsnapshot", response =>
      handleResponse(response, resolve, reject)
    );
  });
};

TeamSpeak.deploySnapshot = snapshot => {
  return new Promise((resolve, reject) => {
    socket.emit("teamspeak-deploysnapshot", snapshot, response =>
      handleResponse(response, resolve, reject)
    );
  });
};

// The ServerQuery returns maximum 200 entries in the clientdblist.
// This function collects all available entries in the client database list.
TeamSpeak.fullClientDBList = async () => {
  let fullClientDbList = [];
  let start = 0;
  let duration = 200;

  try {
    while (
      (
        await TeamSpeak.execute("clientdblist", {
          start,
          duration
        })
      ).length
    ) {
      fullClientDbList.push(
        ...(await TeamSpeak.execute("clientdblist", {
          start,
          duration
        }))
      );

      start += 200;
      duration += 200;
    }
  } catch (err) {
    throw err;
  }

  return fullClientDbList;
};

TeamSpeak.registerEvent = (event, id = undefined) => {
  return new Promise((resolve, reject) => {
    socket.emit(
      "teamspeak-registerevent",
      {
        event,
        id
      },
      response => handleResponse(response, resolve, reject)
    );
  });
};

TeamSpeak.registerAllEvents = () => {
  return Promise.all([
    TeamSpeak.registerEvent("textserver"),
    TeamSpeak.registerEvent("textchannel"),
    TeamSpeak.registerEvent("textprivate"),
    TeamSpeak.registerEvent("server"),
    TeamSpeak.registerEvent("channel", 0)
  ]);
};

TeamSpeak.unregisterEvent = () => {
  return new Promise((resolve, reject) => {
    socket.emit("teamspeak-unregisterevent", response =>
      handleResponse(response, resolve, reject)
    );
  });
};

TeamSpeak.selectServer = sid => {
  return TeamSpeak.execute("use", {sid})
    .then(() => store.commit("setServerId", sid))
    .then(() => TeamSpeak.registerAllEvents())
    .then(() => TeamSpeak.execute("whoami"))
    .then(userInfo => store.commit("saveUserInfo", userInfo[0]));
};

TeamSpeak.on = (name, fn) => {
  TeamSpeak.__proto__.addEventListener(name, fn);
};

socket.on("teamspeak-textmessage", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("textmessage", {
      detail: data
    })
  );
});

socket.on("teamspeak-clientconnect", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("clientconnect", {
      detail: data
    })
  );
});

socket.on("teamspeak-clientdisconnect", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("clientdisconnect", {
      detail: data
    })
  );
});

socket.on("teamspeak-clientmoved", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("clientmoved", {
      detail: data
    })
  );
});

socket.on("teamspeak-tokenused", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("tokenused", {
      detail: data
    })
  );
});

socket.on("teamspeak-serveredit", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("serveredit", {
      detail: data
    })
  );
});

socket.on("teamspeak-channeledit", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("channeledit", {
      detail: data
    })
  );
});

socket.on("teamspeak-channelcreate", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("channelcreate", {
      detail: data
    })
  );
});

socket.on("teamspeak-channelmoved", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("channelmoved", {
      detail: data
    })
  );
});

socket.on("teamspeak-channeldelete", data => {
  TeamSpeak.__proto__.dispatchEvent(
    new CustomEvent("channeldelete", {
      detail: data
    })
  );
});

socket.on("teamspeak-error", err => {
  Vue.prototype.$toasted.error(err.message);

  store.dispatch("clearStorage");

  router.push({name: "login"});
});

socket.on("teamspeak-reconnected", async () => {
  try {
    let queryUser = await TeamSpeak.execute("whoami").then(list => list[0]);

    if (store.state.query.serverId) await TeamSpeak.registerAllEvents();

    store.dispatch("saveConnection", {queryUser, connected: true});

    // When there was a socket error and it reconnected automatically again
    if(router.currentRoute.name === 'login') router.push({name: 'servers'})
  } catch (err) {
    Vue.prototype.$toasted.error(err.message);
  }
});

setLoadingState([
  "execute",
  "createSnapshot",
  "deploySnapshot",
  "selectServer"
]);

export default TeamSpeak;
