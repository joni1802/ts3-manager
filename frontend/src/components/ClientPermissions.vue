<template>
<v-container>
  <v-layout>
    <v-flex xs12>
      <permission-table type="Client Permissions" :grantedPermissions="clientPermissions" :editableContent="['permvalue', 'permskip']" @save="savePermission" @remove="removePermission" @loaded="init">
        <template slot="selectMenu">
          <v-flex sm3 xs12>
            <v-autocomplete :items="clientSelection" v-model="selectedClient" @change="changeClient" label="Client" :disabled="$store.state.query.loading"></v-autocomplete>
          </v-flex>
        </template>
      </permission-table>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
export default {
  components: {
    PermissionTable: () => import('@/components/PermissionTable.vue')
  },
  data() {
    return {
      clientPermissions: [],
      clients: [],
      clientDbId: this.$route.params.cldbid,
    }
  },
  computed: {
    clientSelection() {
      return this.clients.map(client => {
        return {
          text: client.client_nickname,
          value: client.cldbid
        }
      })
    },
    selectedClient: {
      get() {
        let client = this.clients.find(client => client.cldbid == this.clientDbId)

        return client && {
          text: client.client_nickname,
          value: client.cldbid
        }
      },
      set() {
        //
      }
    }
  },
  methods: {
    getClientPermissions() {
      return this.$TeamSpeak.execute('clientpermlist', {
        cldbid: this.clientDbId
      })
    },
    getClientdblist() {
      return this.$TeamSpeak.fullClientDBList()
    },
    changeClient(cldbid) {
      this.$router.push({
        name: 'permissions-client',
        params: {
          cldbid: cldbid
        }
      })
    },
    async savePermission(permissionValues) {
      let {
        permid,
        permskip,
        permvalue
      } = permissionValues

      try {
        await this.$TeamSpeak.execute('clientaddperm', {
          cldbid: this.clientDbId,
          permid: permid,
          permskip: +permskip,
          permvalue: permvalue
        })
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }

      try {
        this.clientPermissions = await this.getClientPermissions()
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }

    },
    async removePermission(permissionValues) {
      let {
        permid
      } = permissionValues

      try {
        await this.$TeamSpeak.execute('clientdelperm', {
          cldbid: this.clientDbId,
          permid: permid
        })
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }

      try {
        this.clientPermissions = await this.getClientPermissions()
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }
    },
    async init() {
      try {
        this.clients = await this.getClientdblist()

        if (!this.clientDbId) {
          this.$router.replace({
            name: 'permissions-client',
            params: {
              cldbid: this.clients[0].cldbid
            }
          })
        }

        this.clientPermissions = await this.getClientPermissions()
      } catch (err) {
        this.$toast.error(err.message, {
          icon: 'error'
        })
      }
    }
  },
  async beforeRouteUpdate(to, from, next) {
    this.clientDbId = to.params.cldbid

    try {
      this.clientPermissions = await this.getClientPermissions()
    } catch (err) {
      this.$toast.error(err.message, {
        icon: 'error'
      })
    }


    next()
  },
}
</script>
