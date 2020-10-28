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
        <v-list-item :href="getDownloadURL(item)">
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

    <file-rename v-model="renameDialog" :item="item" @filerename="$emit('filerename', item)"></file-rename>
    <file-delete v-model="deleteDialog" :item="item" @filedelete="$emit('filedelete', item)"></file-delete>
  </div>
</template>

<script>
export default {
  components: {
    FileRename: () => import("@/components/FileRename"),
    FileDelete: () => import("@/components/FileDelete")
  },
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
    /**
     * Generates download url for the file download.
     * @param  {TreeItem}
     * @return {String}   - download url
     */
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
