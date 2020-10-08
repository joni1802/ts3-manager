<template lang="html">
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Title</v-card-title>
          <v-card-text>

            

            <v-treeview
              :items="rootChannels"


              activatable
              open-on-click


              :load-children="getChildItems"
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

                <v-menu offset-y max-width="300px" v-if="item.source.type === 1">
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
                    <v-list-item>
                      <v-list-item-action>
                        <v-icon>mdi-delete</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Delete File</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-action>
                        <v-icon>mdi-pencil</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Rename File</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <v-list-item v-else>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
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
export default {
  data() {
    return {
      channelList: [],
      rootChannels: [],
      // tree: [],
      active: [],
      token: this.$store.state.query.token,
      serverId: this.$store.state.query.serverId
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

      console.log(filePath);

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
      let url = new URL("http://localhost:3000/download")

      url.searchParams.append("path", this.joinFilePath(path, name))
      url.searchParams.append("name", name)
      url.searchParams.append("cid", cid)
      url.searchParams.append("token", this.token)
      url.searchParams.append("sid", this.serverId)

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
