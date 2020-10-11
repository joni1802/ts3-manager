<template lang="html">
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card>
          <v-card-text>
            <v-treeview
              :items="rootChannels"
              :load-children="getChildItems"
            >
              <!-- open-on-click -->
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
                  :href="getDownloadURL(item.source)"
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
export default {
  components: {
    FileBrowserFile: () => import("@/components/FileBrowserFile"),
    FileBrowserFolder: () => import("@/components/FileBrowserFolder"),
  },
  data() {
    return {
      channelList: [],
      rootChannels: [],
      active: [],
    }
  },
  methods: {
    getChannelList() {
      return this.$TeamSpeak.execute("channellist", {}, ["-flags"])
    },
    // Normally this would be a computed property.
    // But the property load-children is not working with computed properties.
    //
    getRootChannels() {
      return this.channelList.filter(channel => channel.pid === 0)
        .map(rootChannel => {
          return {
            id: rootChannel.cid,
            name: rootChannel.channel_name,
            children: [],
            source: rootChannel
          }
        })
    },
    /**
     * [getChildItems description]
     * @param  {[type]}  channel [description]
     * @return {Promise}         [description]
     */
    async getChildItems(channel) {
      try {
        let subChannels = channel.source.channel_name ?
          this.getSubChannels(channel.source.cid) :
          []

        let files = await this.getFileList(channel.source)

        return channel.children.push(...files, ...subChannels)
      } catch(err) {
        console.log(err);
      }
    },
    getSubChannels(parentId) {
      return this.channelList.filter(channel => channel.pid === parentId)
        .map(subChannel => {
          return {
            id: subChannel.cid,
            name: subChannel.channel_name,
            children: [],
            source: subChannel
          }
        })
    },
    // Is a channel or a sub folder
    // cid: 32
    // datetime: 1601820490
    // name: "lollol.pdf"
    // path: "/"
    // size: 36763
    // type: 1
    getFileList({cid, channel_name, type, path, channel_flag_password, name}) {
      let filePath = "/"
      let channelPassword = ""

      if(type === 0) {
        filePath = this.joinFilePath(path, name)
      }

      return this.$TeamSpeak.execute("ftgetfilelist", {
        cid,
        cpw: channelPassword,
        path: filePath
      }).then(files => {
        console.log(files);

        return files.map(file => {
          let fileItem = {
            name: file.name,
            id: file.name,
            source: file
          }

          // If it is a folder add the property "children" to the object.
          // With this property the item loads all child items on click.
          if(file.type === 0) {
            fileItem.children = []
          }

          return fileItem
        })
      })

    },
    joinFilePath(path, name) {
      let temp = path.split("/")

      // Because "/".split("/") => ["", ""]
      if(temp[1] === "") {
        temp.shift()
      }

      temp.push(name)

      return temp.join("/")
    },
    getDownloadURL({cid, path, name}) {
      let url = new URL(`${process.env.VUE_APP_WEBSOCKET_URI}/download` || "/download")

      url.searchParams.append("path", this.joinFilePath(path, name))
      url.searchParams.append("name", name)
      url.searchParams.append("cid", cid)

      return url.href
    },
  },
  async created() {


    try {
      // let temp = this.$TeamSpeak.execute("ftgetfilelist", {
      //   cid: 33,
      //   cpw: '',
      //   path: '/'
      // })

      this.channelList = await this.getChannelList()
      this.rootChannels = this.getRootChannels()


    } catch (err) {
      console.log(err)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
