import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";
import store from "../store";
import NProgress from "nprogress";

const router = new VueRouter({
  mode: "history",
  routes: routes
});

router.beforeEach((to, from, next) => {
  store.commit("isLoading", true);

  NProgress.start();

  if (to.meta.requiresAuth) {
    if (store.state.query.connected) {
      next();
    } else {
      next({name: "login"});
    }
  } else {
    if (to.name === "login" && store.state.query.connected) {
      next({name: "servers"});
    } else {
      next();
    }
  }
});

router.afterEach((to, from) => {
  store.commit("isLoading", false);

  setTimeout(() => {
    if (store.state.query.loading) {
      NProgress.inc();
    } else {
      NProgress.done();
    }
  }, 0);
});

Vue.use(VueRouter);

export default router;
