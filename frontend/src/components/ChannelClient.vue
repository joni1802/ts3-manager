<template>
<div>
  <v-menu offset-y max-width="300px">
    <template #activator="{ on }">
      <v-list-item v-on="on">
        <v-list-item-avatar>
          <v-img :src="avatar"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ client.client_nickname }} <v-icon>{{ statusIcon }}</v-icon>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-list>
      <v-list-item @click="openPrivateChat(client.clid)">
        <v-list-item-action>
          <v-icon>send</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Open Text Chat
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{name: 'client-edit', params: {clid: client.clid}}">
        <v-list-item-action>
          <v-icon>edit</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Edit Client
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="openKickDialog(4)">
        <v-list-item-action>
          <v-icon>forward</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Kick Client from Channel
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="openKickDialog(5)">
        <v-list-item-action>
          <v-icon>forward</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Kick Client from Server
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{name: 'client-ban', params: {cldbid: client.client_database_id}}">
        <v-list-item-action>
          <v-icon>not_interested</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            Ban Client
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>

  <v-dialog v-model="kickClientDialog" max-width="500px">
    <v-card>
      <v-card-title>Kick from {{ destination }}</v-card-title>
      <v-card-text>
        <v-text-field label="Kick Message" v-model="reason"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="kickClientDialog = false" color="primary">Cancel</v-btn>
        <v-btn text @click="kick" color="primary">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>

<script>
export default {
  props: {
    client: Object,
    queryUser: Object
  },
  data() {
    return {
      kickClientDialog: false,
      reason: '',
      destination: '',
      reasonid: null,
      avatar: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
    }
  },
  computed: {
    statusIcon() {
      if (this.client.client_away === 1) {
        return 'cancel_presentation'
      } else if (this.client.client_output_muted === 1) {
        return 'volume_off'
      } else if (this.client.client_input_muted === 1) {
        return 'mic_off'
      } else {
        return 'fiber_manual_record'
      }
    }
  },
  methods: {
    openKickDialog(reasonid) {
      // reasonid :
      // 4 = kick form current channel into default channel
      // 5 = kick from server
      this.reasonid = reasonid

      switch (this.reasonid) {
        case 4:
          this.destination = 'Channel'
          break;
        case 5:
          this.destination = 'Server'
      }

      this.kickClientDialog = true
    },
    async kick() {
      try {
        await this.$TeamSpeak.execute('clientkick', {
          reasonid: this.reasonid,
          reasonmsg: this.reason,
          clid: this.client.clid
        })
      } catch (err) {
        this.$toasted.error(err.message)
      }

      this.kickClientDialog = false
    },
    openPrivateChat(clid) {
      this.$router.push({name: 'chat', query: {client: clid}})
    },
    getClientDbInfo() {
      return this.$TeamSpeak.execute("clientdbinfo", {
        cldbid: this.client.client_database_id
      }).then(info => info[0])
    },
    getAvatarDownloadURL(base64Hash) {
      let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
      let url = new URL("/api/download", base)

      url.searchParams.append("path", "/")
      url.searchParams.append("name", `avatar_${base64Hash}`)
      url.searchParams.append("cid", 0)

      return url.href
    },
    getAvatar(url) {
      return fetch(url, {credentials: 'include'})
        .then(res => res.blob())
    },
    async setAvatar() {
      try {
        let clientDbInfo = await this.getClientDbInfo()



        // If client has an avatar
        if(clientDbInfo.client_flag_avatar) {
          let url = this.getAvatarDownloadURL(clientDbInfo.client_base64HashClientUID)
          let blob = await this.getAvatar(url)

          this.avatar = URL.createObjectURL(blob)
        }
      } catch(err) {
        console.log(err);
        this.$toasted.error(err.message)
      }
    }
  },
  async created() {
    // If is not the serveradmin
    if(this.client.client_database_id !== 1) {
       await this.setAvatar()
    }
  }
}
</script>

<style scoped>
* {
  text-transform: none !important;
}
</style>
