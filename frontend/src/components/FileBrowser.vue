<template lang="html">
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card>
          <v-card-title>
            <file-delete-button :selectedFiles="selectedFiles" @filedelete="updateParentItem"></file-delete-button>
            <v-spacer></v-spacer>
            <!-- <v-text-field append-icon="search" label="Search"></v-text-field> -->
          </v-card-title>
          <v-card-text>
            <v-treeview
              :items="folderList"
              :load-children="getChildItems"
              return-object
              selectable
              v-model="selectedFiles"
              selection-type="independent"
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
 * @property {(Number|String)} id     - channel id or name of file or folder
 * @property {(Number|String)} [pid]  - id of the parent element
 * @property {String} name            - name of channel, file or folder
 * @property {String} [path]          - path of folder or file
 * @property {Number} cid             - channel id
 * @property {Number} [type]          - type 0 = folder, type 1 = file, type undefined = channel
 * @property {Number} [datetime]      - file or folder creation date
 * @property {Number} [size]          - file size in bytes
 * @property {Array} [children]       - child items
 */

import Path from "path-browserify"

export default {
  components: {
    FileBrowserFile: () => import("@/components/FileBrowserFile"),
    FileBrowserFolder: () => import("@/components/FileBrowserFolder"),
    FileDeleteButton: () => import("@/components/FileDeleteMultiple")
  },
  data() {
    return {
      folderList: [],
      selectedFiles: [],
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
    getFileList({cid, type, path, name, id}) {
      return this.$TeamSpeak.execute("ftgetfilelist", {
        cid,
        cpw: "",
        path: path ? Path.join(path, name) : "/"
      }).then(files => {
        return files.map(file => {
          let item = {
            id: `${file.name}-${file.datetime}`,
            pid: id,
            name: file.name,
            path: file.path,
            cid: file.cid,
            type: file.type,
            datetime: file.datetime,
            size: file.size
          }

          // Add possibilty to load more child items if it is a folder
          if(file.type === 0) {
            item.children = []
          }

          return item
        })
      })
    },

    /**
     * Reload child items of the parent folder when a file has changed.
     * @param  {TreeItem} item  - folder or file
     */
    async updateParentItem(item) {
      if(item.path !== undefined) {
        let parentItem = this.findParentItem(item.pid, this.folderList)

        await this.getChildItems(parentItem)
      } else {
        await this.getChildItems(item)
      }

    },

    /**
     * Return the parent elemen of an item.
     * @param  {(Number|String)} pid    - parent id
     * @param  {Array.<TreeItem>} items - children
     * @return {TreeItem}               - folder or channel
     */
    findParentItem(pid, items) {
      for(let item of items) {
        if(item.id === pid) {
          return item
        } else {
          if(item.children && item.children.length) {
            return this.findParentItem(pid, item.children)
          }
        }
      }
    },
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
