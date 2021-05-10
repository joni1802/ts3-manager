const state = {
  queue: []
}

const mutations = {
  addFileToQueue(state, file) {
    state.queue.push(file)
  },
  removeFileFromQueue(state, clientftfid) {
    let index = state.queue.findIndex(file => file.clientftfid === clientftfid)

    state.queue.splice(index, 1)
  },
  setFileUploadProgress(state, percentage) {
    state.queue[0].progress = percentage
  },
  setFileBlob(state, {index, blob}) {
    state.queue[index].blob = blob
  }
}

const actions = {




  // async setUploadFiles({commit}) {
  //   try {
  //     let keys = await db.keys()
  //
  //     for(let key of keys) {
  //       let file = await db.getItem(key)
  //
  //       commit('addFile', file)
  //     }
  //   } catch(err) {
  //     Vue.prototype.$toast.error(err.message)
  //   }
  // },
  //
  // getUploadFileId(_context, {filename, cid, path}) {
  //   return btoa(`${filename}${cid}${path}`)
  // },
  //
  // async saveUploadFile({commit, dispatch}, {blob, cid, path}) {
  //   let fileId = await dispatch('getUploadFileId', {filename: blob.name, cid, path})
  //   let existingFile = await db.getItem(fileId)
  //
  //   if(existingFile) {
  //     throw new Error('The file is already in the upload queue')
  //   } else {
  //     let file = {blob, fileId, cid, path}
  //     let newFile = await db.setItem(fileId, file)
  //
  //     commit('addFile', file)
  //
  //     return newFile
  //   }
  // },
  //
  // async removeUploadFile({commit}, fileId) {
  //   await db.removeItem(fileId)
  //
  //   commit('removeFile', fileId)
  // },
  //
  // createRequest({state, commit}, fileId) {
  //   commit('addRequest', fileId)
  //
  //   return state.requests[fileId]
  // },
  //
  // getUploadUrl(_context, {cid, path}) {
  //   let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
  //   let url = new URL("/api/upload", base)
  //
  //   url.searchParams.append("path", path)
  //   url.searchParams.append("cid", cid)
  //
  //   return url.href
  // },
  //
  // setUploadProgress({commit}, {e, fileId}) {
  //   let percentage = (e.loaded / e.total) * 100
  //
  //   Vue.set(state.progress, fileId, percentage)
  //
  //   commit('addProgress', {fileId, percentage})
  // },
  //
  // async uploadFile({state, commit, dispatch}, file) {
  //   try {
  //     let cid = file.cid
  //     let path = file.path
  //     // let cancelToken = file.cancelToken
  //
  //     let {blob, fileId} = await dispatch('saveUploadFile', {blob: file.blob, cid, path})
  //
  //     let request = await dispatch('createRequest', fileId)
  //
  //     let formData = new FormData()
  //
  //     formData.append('file', blob)
  //
  //     await axios({
  //       headers: [
  //         {'x-file-size': blob.size},
  //         {'x-file-name': blob.name}
  //       ],
  //       method: 'POST',
  //       url: await dispatch('getUploadUrl', {cid, path}),
  //       withCredentials: true,
  //       data: formData,
  //       onUploadProgress: async (e) => {
  //         await dispatch('setUploadProgress', {e, fileId})
  //       }
  //     })
  //
  //     await dispatch('removeFile', )
  //
  //     // Send Cookies
  //     // request.withCredentials = true
  //     //
  //     // request.open("POST", await dispatch('getUploadUrl', {cid, path}))
  //     //
  //     // request.setRequestHeader("x-file-size", blob.size)
  //     // request.setRequestHeader("x-file-name", blob.name)
  //     //
  //     // request.addEventListener("readystatechange", e => {
  //     //   // Request done
  //     //   if(request.readyState === 4) {
  //     //     if(request.status === 200) {
  //     //       Vue.prototype.$toast.success("File successfully uploaded")
  //     //
  //     //       dispatch('removeUploadFile', fileId)
  //     //     } else {
  //     //       request.response && Vue.prototype.$toast.error(request.response)
  //     //     }
  //     //   }
  //     // })
  //     //
  //     // request.upload.addEventListener("progress", async (e) => {
  //     //   await dispatch('setUploadProgress', {e, fileId})
  //     // })
  //     //
  //     // request.send(formData)
  //   } catch(err) {
  //     console.log(err)
  //
  //     Vue.prototype.$toast.error(err.message)
  //   }
  // },
  //
  // abortFileUpload({commit}, fileId) {
  //   commit('abortRequest', fileId)
  //   // commit('removeRequest', fileId)
  // }

}

export default {
  state,
  mutations,
  actions
}
