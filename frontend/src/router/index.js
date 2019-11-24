import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import store from '../store'

const router = new VueRouter({
  mode: 'history',
  routes: routes
})

router.beforeEach((to, from, next) => {
  if(to.meta.requiresAuth) {
    if(store.state.connection.connected) {
      next()
    } else {
      next({name: 'login'})
    }
  } else {
    if(to.name === 'login' && store.state.connection.connected) {
      next({name: 'servers'})
    } else {
      next()
    }
  }
})

Vue.use(VueRouter)

export default router
