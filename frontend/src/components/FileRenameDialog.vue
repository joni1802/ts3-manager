<template lang="html">
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>Rename {{ item.type === 0 ? "Folder" : "File" }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="newFileName" :label="item.type === 0 ? 'Folder' : 'File'"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="renameFile" color="primary" :disabled="newFileName === item.name">OK</v-btn>
        <v-btn text @click="dialog = false" color="primary">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Path from "path-browserify"

export default {
  props: {
    /**
     * File or folder
     * Folders are handled by the ServerQuery like files.
     * @type {TreeItem}
     */
    item: Object,
    value: Boolean
  },
  data() {
    return {
      newFileName: ""
    }
  },
  computed: {
    dialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit("input", val)
      }
    }
  },
  methods: {
    /**
     * Rename the file or folder.
     */
    async renameFile() {
      let {cid, path, name} = this.item

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

      this.$emit("filerename", this.item)
    },
  },
  watch: {
    dialog(open) {
      if(open) {
        this.newFileName = this.item.name
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
