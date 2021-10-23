import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";
import store from "../store";

const router = new VueRouter({
  mode: "history",
  routes: routes,
});

router.beforeEach((to, from, next) => {
  store.dispatch("startLoading");

  if (to.meta.requiresAuth) {
    if (store.state.query.connected) {
      next();
    } else {
      next({ name: "login" });
    }
  } else {
    if (to.name === "login" && store.state.query.connected) {
      next({ name: "servers" });
    } else {
      next();
    }
  }
});

router.afterEach((to, from) => {
  store.dispatch("stopLoading");
});

Vue.use(VueRouter);

export default router;
