import TeamSpeak from "@/api/TeamSpeak"
import Vue from "vue"

const state = {
  // Contains the client database id, information of the avatar file and the file itself as a blob
  files: []
}

const mutations = {
  saveAvatar(state, avatar) {
    state.files.push(avatar)
  },
  removeAvatar(state, name) {
    state.files = state.files.filter(avatar => avatar.name !== name)
  }
}

const actions = {
  getAvatarFileInfo(_context, name) {
    return TeamSpeak.execute("ftgetfileinfo", {
      cid: 0,
      cpw: '', // maybe check if the server has a password is needed in this case
      name
    }).then(info => info[0])
  },
  getClientDbInfo(_context, clientDbId) {
    return TeamSpeak.execute("clientdbinfo", {
      cldbid: clientDbId
    }).then(info => info[0])
  },
  async getClientAvatars({dispatch, commit, state}, clientDbIdList) {
    for(let clientDbId of clientDbIdList) {
      try {
        // The serveradmin has no database data
        if(clientDbId !== 1) {
          let clientDbInfo = await dispatch("getClientDbInfo", clientDbId)

          // If client has an avatar
          if(clientDbInfo.client_flag_avatar) {
            let fileName = `/avatar_${clientDbInfo.client_base64HashClientUID}`
            let avatarFileInfo = await dispatch("getAvatarFileInfo", fileName)
            let currentAvatar = state.files.find(avatar => avatar.name === avatarFileInfo.name)

            // Download new avatar file if the datetime has changed or it is not in the list
            if(!currentAvatar || currentAvatar.datetime !== avatarFileInfo.datetime) {
              let base64 = await TeamSpeak.downloadFile(fileName, 0, "")
              // let blob = new Blob([new Uint8Array(buffer.data)])

              // let u8 = new Uint8Array(buffer.data)
              // let decoded = new TextDecoder().decode(u8)



              // console.log('Downloaded new Avatar', btoa(decoded) );

              commit("removeAvatar", fileName)
              commit("saveAvatar", {
                ...avatarFileInfo,
                base64,
                clientDbId
              })
            }
          }
        }
      } catch(err) {
        console.log(err);
        Vue.prototype.$toast.error(err.message)
      }
    }
  }
}

export default {
  state,
  mutations,
  actions
}
