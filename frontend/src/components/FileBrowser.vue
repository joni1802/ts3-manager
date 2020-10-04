<template lang="html">
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Title</v-card-title>
          <v-card-text>

            <v-btn @click="testDownload">Test Download</v-btn>

            <v-treeview
              :items="rootChannels"


              activatable
              open-on-click


              :load-children="getChildItems"
            >
            <!-- item-children="files" -->
            <!-- v-model="tree" -->
              <template #prepend="{ item, open, active }">
                <v-icon v-if="item.source.channel_name || item.source.type === 0" >
                  {{ open || active ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <v-icon v-else>
                  mdi-file
                </v-icon>
              </template>
              <template #label="{ item }">
                <v-progress-linear v-if="item.source.type === 1" value="15"></v-progress-linear>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle v-if="item.source.type === 1">
                      {{ item.source.size }} Bytes
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {saveAs} from 'file-saver'


export default {
  data() {
    return {
      channelList: [],
      rootChannels: [],
      // tree: [],
      active: []
    }
  },
  computed: {
    // fileTree: {
    //   get() {
    //     return this.channelList.filter(channel => channel.pid === 0)
    //       .map(rootChannel => {
    //         return {
    //           id: rootChannel.cid,
    //           name: rootChannel.channel_name,
    //           children: [],
    //           channel: true
    //         }
    //       })
    //   },
    //   set(val) {
    //     console.log(val);
    //   }
    // },
  },
  methods: {
    async testDownload() {
      try {
        let path = "/ts3_manager_new_converted.png"
        let cid = 33
        let cpw = ""

        let res = await this.$TeamSpeak.downloadFile(path, cid, cpw)

        // console.log(res.data);

        let buffer = new Uint8Array(res.data)
        let blob = new Blob([buffer]) // {type: "image/png"}





        console.log(buffer);
        console.log(blob);

        saveAs(blob, "yolo.png")


      } catch(err) {
        console.log(err);
      }
    },
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
    getFileList({cid, channel_name, type, path, channel_flag_password, name}) {
      let filePath = "/"
      let channelPassword = ""

      if(type === 0) {
        filePath = this.joinFilePath(path, name)
      }

      console.log(filePath);

      return this.$TeamSpeak.execute("ftgetfilelist", {
        cid,
        cpw: channelPassword,
        path: filePath
      }).then(files => {
        // console.log(files);

        return files.map(file => {
          let fileItem = {
            name: file.name,
            id: file.name,
            source: file
          }

          // If it is a folder
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

    // createFileTree(channelList, parentId) {
    //   let out = []
    //
    //   for (let channel of channelList) {
    //     if (channel.pid === parentId) {
    //       let children = this.createFileTree(channelList, channel.cid)
    //
    //       if (children.length) {
    //         channel.children = children
    //       }
    //
    //       out.push(channel)
    //     }
    //   }
    //
    //   return out
    // }
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

      // console.log(this.channelList);

      // let temp = this.createFileTree(this.channelList, 0)
      //
      // console.log(temp);
    } catch (err) {
      console.log(err)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
