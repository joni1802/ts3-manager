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
                <v-icon v-if="item.source.channel_name || item.source.type === 0" >
                  {{ open || active ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <v-icon v-else>
                  mdi-file
                </v-icon>
              </template>
              <template #label="{ item }">
                <file-browser-file
                  v-if="item.source.type === 1"
                  :item="item"
                  @filerename="updateChildItems"
                >
                </file-browser-file>
                <file-browser-folder
                  v-else
                  :item="item"
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
import Path from "path-browserify"

export default {
  components: {
    FileBrowserFile: () => import("@/components/FileBrowserFile"),
    FileBrowserFolder: () => import("@/components/FileBrowserFolder"),
  },
  data() {
    return {
      channelList: [],
      folderList: [],
      openFolders: [],
    }
  },
  methods: {
    doStuff(stuff) {
      console.log(stuff);
    },
    getChannelList() {
      return this.$TeamSpeak.execute("channellist", {}, ["-flags"])
    },
    // Normally this would be a computed property.
    // But the property load-children is not working with computed properties.
    getFolderList() {
      return this.channelList.map(channel => {
        return {
          id: channel.cid,
          name: channel.channel_name,
          children: [],
          source: channel
        }
      })
    },
    /**
     * Loads all child items form the server.
     * Child items are files or folders.
     * @param  {Object}  parentItem channel or folder inside a channel
     * @return {Promise}            child items
     */
    async getChildItems(parentItem) {
      try {
        let childItems = await this.getFileList(parentItem.source)

        return parentItem.children.push(...childItems)
      } catch(err) {
        this.$toasted.error(err.message)
      }
    },
    // Is a channel or a sub folder
    // cid: 32
    // datetime: 1601820490
    // name: "lollol.pdf"
    // path: "/"
    // size: 36763
    // type: 1
    getFileList({cid, type, path, name}) {
      let filePath = "/"

      // If it is a folder
      if(type === 0) {
        filePath = Path.join(path, name)
      }

      return this.$TeamSpeak.execute("ftgetfilelist", {
        cid,
        cpw: "",
        path: filePath
      }).then(files => {
        return files.map(file => {
          let fileItem = {
            name: file.name,
            id: file.name,
            source: file
          }

          // With this property the item loads all child items on click.
          if(file.type === 0) {
            fileItem.children = []
          }

          return fileItem
        })
      })

    },
    /**
     * [updateChildItems description]
     * @param  {[type]} file [description]
     * @return {[type]}      [description]
     */
    updateChildItems(file) {
      let itemParentId = file.path === "/" ? file.cid : file.path.split("/").pop()
      let parentItem = this.openFolders.find(folder => folder.id === itemParentId)

      // Remove all current child items
      parentItem.children = []

      // Reload child items
      this.getChildItems(parentItem)
    }
  },
  async created() {
    try {
      this.channelList = await this.getChannelList()
      this.folderList = this.getFolderList()
    } catch (err) {
      this.$toasted.error(err.message)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
