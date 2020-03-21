/* eslint-disable no-console */

import {register} from "register-service-worker";
import Vue from "vue";

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      );
    },
    registered() {
      console.log("Service worker has been registered.");
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound() {
      console.log("New content is downloading.");
    },
    updated() {
      console.log("New content is available; please refresh.");

      // https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth
      Vue.prototype.$toast(null, {
        icon: "mdi-alert-decagram",
        color: "#ec407a",
        timeout: 0,
        slot: [
          "New Version Available",
          this.$createElement(
            "v-btn",
            {
              on: {
                click: () => {
                  localStorage.clear();
                  location.reload();
                }
              },
              attrs: {
                color: "purple"
              }
            },
            ["Update"]
          )
        ]
      });
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    }
  });
}
