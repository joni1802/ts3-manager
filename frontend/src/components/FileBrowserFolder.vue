<template lang="html">
  <div>

    <v-menu offset-y max-width="300px">
      <template #activator="{ on, attrs }">
        <v-list-item v-bind="attrs" v-on="on">
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-list>
        <v-list-item @click="goToUploadRoute">
          <v-list-item-action>
            <v-icon>mdi-upload</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Upload File</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="openSubfolderDialog">
          <v-list-item-action>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Create Subfolder</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Disable option if it is a channel  -->
        <v-list-item @click="renameDialog = true" :disabled="item.type === undefined">
          <v-list-item-action>
            <v-icon>mdi-pencil</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Rename Folder</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Disable option if it is a channel  -->
        <v-list-item @click="deleteDialog = true" :disabled="item.type === undefined">
          <v-list-item-action>
            <v-icon>mdi-delete</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Delete Folder</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="subfolderDialog" max-width="500px">
      <v-card>
        <v-card-title>Create Folder</v-card-title>
        <v-card-text>
          <v-text-field v-model="newSubfolderName" label="Folder Name"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="createSubfolder" color="primary">OK</v-btn>
          <v-btn text @click="subfolderDialog = false" color="primary">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <file-rename-dialog v-model="renameDialog" :item="item" @filerename="$emit('folderrename', item)"></file-rename-dialog>
    <file-delete-dialog v-model="deleteDialog" :item="item" @filedelete="$emit('folderdelete', item)"></file-delete-dialog>
  </div>
</template>

<script>
import Path from "path-browserify"

export default {
  components: {
    FileRenameDialog: () => import("@/components/FileRenameDialog"),
    FileDeleteDialog: () => import("@/components/FileDeleteDialog")
  },
  props: {
    /**
     * Channel or folder
     * @type {TreeItem}
     */
    item: Object,
  },
  data() {
    return {
      subfolderDialog: false,
      deleteDialog: false,
      renameDialog: false,
      newSubfolderName: "",
    }
  },
  methods: {
    openSubfolderDialog() {
      this.subfolderDialog = true

      this.newSubfolderName = ""
    },
    async createSubfolder() {
      let {cid, path, name} = this.item
      let currentPath = path ? Path.join(path, name) : "/"

      try {
        await this.$TeamSpeak.execute("ftcreatedir", {
          cid,
          cpw: "",
          dirname: Path.join(currentPath, this.newSubfolderName)
        })

        this.subfolderDialog = false
      } catch(err) {
        this.$toast.error(err.message)
      }

      this.$emit("subfoldercreate", this.item)
    },
    goToUploadRoute() {
      let uploadRoute = {
        name: "file-upload",
        params: {
          cid: this.item.cid
        }
      }

      if(this.item.path) {
        uploadRoute.query = {
          path: Path.join(this.item.path, this.item.name)
        }
      }

      this.$router.push(uploadRoute)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
