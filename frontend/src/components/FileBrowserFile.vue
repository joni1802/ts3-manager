<template lang="html">
  <div>
    <v-menu offset-y max-width="300px">
      <template #activator="{ on, attrs }">
        <v-list-item v-bind="attrs" v-on="on">
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ Math.round(item.size / 1024).toLocaleString() }} Kibibytes
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-list>
        <v-list-item @click="downloadFile">
          <v-list-item-action>
            <v-icon>mdi-download</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Download File</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="deleteDialog = true">
          <v-list-item-action>
            <v-icon>mdi-delete</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Delete File</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="renameDialog = true">
          <v-list-item-action>
            <v-icon>mdi-pencil</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Rename File</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

    <file-rename-dialog v-model="renameDialog" :item="item" @filerename="$emit('filerename', item)"></file-rename-dialog>
    <file-delete-dialog v-model="deleteDialog" :item="item" @filedelete="$emit('filedelete', item)"></file-delete-dialog>
  </div>
</template>

<script>
import fileTransfer from "@/mixins/fileTransfer"

export default {
  components: {
    FileRenameDialog: () => import("@/components/FileRenameDialog"),
    FileDeleteDialog: () => import("@/components/FileDeleteDialog")
  },
  mixins: [
    fileTransfer
  ],
  props: {
    /**
     * File
     * @type {TreeItem}
     */
    item: Object,
  },
  data() {
    return {
      renameDialog: false,
      deleteDialog: false,
      newFileName: ""
    }
  },
  methods: {
    getDownloadUrl(ftkey, port, size, name) {
      let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
      let url = new URL("/api/download", base)

      url.searchParams.append("ftkey", ftkey)
      url.searchParams.append("port", port)
      url.searchParams.append("size", size)
      url.searchParams.append("name", name)

      return url.href
    },
    initFileDownload(cpw = "", seekpos = 0) {
      return this.$TeamSpeak.execute("ftinitdownload", {
        clientftfid: this.getClientFileTransferId(),
        name: this.getFilePath(this.item.path, this.item.name),
        cid: this.item.cid,
        cpw,
        seekpos
      }).then(res => res[0])
    },
    async downloadFile() {
      try {
        let {name} = this.item
        let {ftkey, port, size} = await this.initFileDownload()
        let url = this.getDownloadUrl(ftkey, port, size, name)

        window.open(url)
      } catch(err) {
        this.$toast.error(err.message)
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
