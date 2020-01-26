const state = {
  loading: false
}

const mutations = {
  isLoading(state, status) {
    state.loading = status
  }
}

// const subscribe = (mutation, state) => {
//   console.log(mutation.type);
// }

export default {
  state,
  mutations,
  // subscribe
}