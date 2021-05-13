const state = {
  queue: []
}

const getters = {
  uploading: state => {
    return !!state.queue.find(file => file.uploading)
  }
}

const mutations = {
  addFileToQueue(state, file) {
    state.queue.push(file)
  },
  removeFileFromQueue(state, clientftfid) {
    let index = state.queue.findIndex(file => file.clientftfid === clientftfid)

    state.queue.splice(index, 1)
  },
  setFileUploadProgress(state, {clientftfid, percentage}) {
    let index = state.queue.findIndex(file => file.clientftfid === clientftfid)

    state.queue[index].progress = percentage
  },
  resetUploadState(state) {
    for(let i = 0; i < state.queue.length; i++) {
      state.queue[i].uploading = false
    }
  }
}

export default {
  state,
  getters,
  mutations
}
