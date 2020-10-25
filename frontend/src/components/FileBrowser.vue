<template lang="html">
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card>
          <v-card-text>
            <v-treeview
              :items="folderList"
              :load-children="getChildItems"
              :open.sync="openFolders"
              return-object
            >
              <template #prepend="{ item, open, active }">
                <v-icon v-if="item.type !== 1" >
                  {{ open || active ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <v-icon v-else>
                  mdi-file
                </v-icon>
              </template>
              <template #label="{ item }">
                <file-browser-file
                  v-if="item.type === 1"
                  :item="item"
                  @filerename="updateParentItem"
                  @filedelete="updateParentItem"
                >
                </file-browser-file>
                <file-browser-folder
                  v-else
                  :item="item"
                  @subfoldercreate="getChildItems"
                  @folderdelete="updateParentItem"
                  @folderrename="updateParentItem"
                >
                </file-browser-folder>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
/**
 * Item in the file tree.
 * @typedef {Object} TreeItem
 * @property {Number} id          - channel id or name of file or folder
 * @property {String} name        - name of channel, file or folder
 * @property {String} [path]      - path of folder or file
 * @property {Number} cid         - channel id
 * @property {Number} [type]      - type 0 = folder, type 1 = file, type undefined = channel
 * @property {Number} [datetime]  - file or folder creation date
 * @property {Number} [size]      - file size in bytes
 * @property {Array} [children]   - child items
 */

import Path from "path-browserify"

export default {
  components: {
    FileBrowserFile: () => import("@/components/FileBrowserFile"),
    FileBrowserFolder: () => import("@/components/FileBrowserFolder"),
  },
  data() {
    return {
      folderList: [],
      openFolders: [],
    }
  },
  methods: {
    /**
     * The root folder list which are all channels on the server.
     * @return {Array.<TreeItem>}
     */
    getFolderList() {
      return this.$TeamSpeak.execute("channellist")
        .then(channels => {
          return channels.map(channel => {
            return {
              id: channel.cid,
              name: channel.channel_name,
              cid: channel.cid,
              children: []
            }
          })
        })
    },

    /**
     * Add child items to the current item.
     * @param  {Object}  parentItem - channel or folder inside a channel
     * @return {Object}             - parent element with the loaded child items
     */
    async getChildItems(parentItem) {
      try {
        let childItems = await this.getFileList(parentItem)

        parentItem.children = childItems

        // return parentItem.children.push(...childItems)
      } catch(err) {
        this.$toasted.error(err.message)
      }
    },

    /**
     * Loads the file list from the ServerQuery.
     * A file list contains files and folders.
     * @param  {TreeItem}
     * @return {Array.<TreeItem>}
     */
    getFileList({cid, type, path, name}) {
      return this.$TeamSpeak.execute("ftgetfilelist", {
        cid,
        cpw: "",
        path: path ? Path.join(path, name) : "/"
      }).then(files => {
        return files.map(file => {
          file.id = file.name // file name is always unique

          // Add possibilty to load more child items if it is a folder
          if(file.type === 0) {
            file.children = []
          }

          return file
        })
      })
    },

    /**
     * Reload child items of the parent folder when a file has changed.
     * @param  {TreeItem} file
     */
    updateParentItem(file) {
      let folderId = file.path === "/" ? file.cid : file.path.split("/").pop()
      let folder = this.openFolders.find(folder => folder.id === folderId)

      this.getChildItems(folder)
    }
  },
  async created() {
    try {
      this.folderList = await this.getFolderList()
    } catch (err) {
      this.$toasted.error(err.message)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
