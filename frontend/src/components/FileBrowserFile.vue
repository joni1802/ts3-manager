<template lang="html">
  <div>

    <v-menu offset-y max-width="300px">
      <template #activator="{ on, attrs }">
        <v-list-item v-bind="attrs" v-on="on">
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ item.source.size }} Bytes
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-list>
        <v-list-item :href="getDownloadURL(item.source)">
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
        <v-list-item @click="openRenameDialog">
          <v-list-item-action>
            <v-icon>mdi-pencil</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Rename File</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="renameDialog" max-width="500px">
      <v-card>
        <v-card-title>Rename File</v-card-title>
        <v-card-text>
          <v-text-field v-model="newFileName"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="renameFile" color="primary" :disabled="newFileName === item.source.name">OK</v-btn>
          <v-btn text @click="renameDialog = false" color="primary">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Delete File</v-card-title>
        <v-card-text>
          Do you really want to delete this file?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteFile" color="primary">Yes</v-btn>
          <v-btn text @click="deleteDialog = false" color="primary">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Path from "path-browserify"

export default {
  props: {
    item: Object, // file
  },
  data() {
    return {
      renameDialog: false,
      deleteDialog: false,
      newFileName: ""
    }
  },
  methods: {
    openRenameDialog() {
      this.renameDialog = true

      this.newFileName = this.item.name
    },
    async renameFile() {
      let {cid, path, name} = this.item.source

      try {
        await this.$TeamSpeak.execute("ftrenamefile", {
          cid,
          cpw: "",
          oldname: Path.join(path, name),
          newname: Path.join(path, this.newFileName)
        })
      } catch(err) {
        this.$toasted.error(err.message)
      }

      this.$emit("filechange", this.item.source)
    },
    async deleteFile() {
      let {cid, path, name} = this.item.source

      try {
        await this.$TeamSpeak.execute("ftdeletefile", {
          cid,
          cpw: "",
          name: Path.join(path, name)
        })
      } catch(err) {
        this.$toasted.error(err.message)
      }

      this.$emit("filechange", this.item.source)
    },
    getDownloadURL({cid, path, name}) {
      let base = process.env.VUE_APP_WEBSOCKET_URI || window.location.origin
      let url = new URL("/api/download", base)

      url.searchParams.append("path", path)
      url.searchParams.append("name", name)
      url.searchParams.append("cid", cid)

      return url.href
    }
  }
}
</script>

<style lang="css" scoped>
</style>
