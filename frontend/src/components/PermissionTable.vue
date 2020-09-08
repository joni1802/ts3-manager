<template>
<div>
  <v-card>
    <v-card-title>
      <v-layout justify-space-between wrap>
        <slot name="selectMenu"></slot>
        <v-flex xs12 sm5>
          <v-text-field v-model="filter" append-icon="filter_list" label="Filter"></v-text-field>
        </v-flex>
        <v-flex xs12 sm2>
          <v-checkbox v-model="onlyGranted" label="only granted" primary></v-checkbox>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-text>
      <v-data-table
        :no-data-text="$store.state.query.loading ? '...loading' : $vuetify.noDataText"
        :headers="headers"
        :items="permissionlist"
        :footer-props="{'items-per-page-options': rowsPerPage}"
        :search="filter"
      >
      <template #item.actions="{ item }">
        <v-menu>
          <template #activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="editPermission(item)">
              <v-list-item-title>
                Edit Permission
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="confirmDeletion(item)">
              <v-list-item-title>
                Remove Permission
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
        <template v-if="editableContent.includes('permvalue')" #item.permvalue="{ item }">
          {{ item.permvalue }}
        </template>
        <template v-if="editableContent.includes('permskip')" #item.permskip="{ item }">
          <v-simple-checkbox
            v-if="typeof item.permskip !== 'object'"
            :value="!!item.permskip"
            disabled
          >
          </v-simple-checkbox>
        </template>
        <template v-if="editableContent.includes('permnegated')" #item.permnegated="{ item }">
          <v-simple-checkbox
            v-if="typeof item.permnegated !== 'object'"
            :value="!!item.permnegated"
            disabled
          >
          </v-simple-checkbox>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>{{ editedPermission.permdesc }}</v-card-title>
      <v-card-text>
        <v-layout wrap justify-space-between>
          <v-flex xs12 v-if="editableContent.includes('permvalue')">
            <v-text-field label="Value" type="number" v-model="editedPermission.permvalue"></v-text-field>
          </v-flex>
          <v-flex xs5 v-if="editableContent.includes('permskip')">
            <v-checkbox label="Skip" v-model="editedPermission.permskip"></v-checkbox>
          </v-flex>
          <v-flex xs5 v-if="editableContent.includes('permnegated')">
            <v-checkbox label="Negated" v-model="editedPermission.permnegated" :disabled="type === 'Client Permissions' ? true : false"></v-checkbox>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="savePermission" color="primary">Save</v-btn>
        <v-btn text @click="dialog = false" color="primary">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card>
      <v-card-title>Remove Permission</v-card-title>
      <v-card-text>
        Do you really want to remove the <b>{{ editedPermission.permname }}</b> permission values?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="removePermission" color="primary">Yes</v-btn>
        <v-btn text @click="deleteDialog = false" color="primary">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>
<script>
export default {
  props: {
    type: String, // e.g. Server Group, Client Channel etc...
    grantedPermissions: Array, // current permission that are set for the group, client etc...
    editableContent: Array, // e.g ['permvalue', 'permskip', 'permnegated']
  },
  data() {
    return {
      availablePermissions: [], // All available permissions that could be set
      onlyGranted: true, // Only show granted Permissions on default
      availableHeaders: [
        {
          text: '',
          align: 'start',
          value: 'actions',
          sortable: false
        },
        {
          text: 'Permission',
          align: 'left',
          value: 'permname',
          sortable: false
        },
        {
          text: 'Value',
          align: 'left',
          value: 'permvalue',
          sortable: false
        },
        {
          text: 'Skip',
          align: 'left',
          value: 'permskip',
          sortable: false
        },
        {
          text: 'Negate',
          align: 'left',
          value: 'permnegated',
          sortable: false
        },
      ],
      rowsPerPage: [
        50,
        100,
        150,
        -1
      ],
      filter: '', // Filter table content
      dialog: false, // Shows the edit lightbox
      deleteDialog: false,
      editedPermission: {
        permdesc: '',
        permname: '',
        permid: null,
        permnegated: null,
        permskip: null,
        permvalue: null
      }
    }
  },
  computed: {
    permissionlist() {
      let list = this.availablePermissions.map(permission => {
        let permissionValues = this.grantedPermissions.find(perm => perm.permid === permission.permid) ? this.grantedPermissions.find(perm => perm.permid === permission.permid) : {
          "permvalue": null,
          "permnegated": null,
          "permskip": null
        }

        return {
          ...permission,
          ...permissionValues
        }
      })

      if (this.onlyGranted) {
        return list.filter(permission => permission.permvalue !== null)
      } else {
        return list
      }
    },
    headers() {
      return this.availableHeaders.filter(header => {
        for (let value of this.editableContent) {
          if (header.value === value || header.value === 'permname' || header.value === 'actions') {
            return header
          }
        }
      })
    }
  },
  methods: {
    getPermissionlist() {
      return this.$TeamSpeak.execute('permissionlist')
    },
    editPermission(permissionValues) {
      this.editedPermission = {
        ...permissionValues
      }
      this.editedPermission.permskip = Boolean(parseInt(this.editedPermission.permskip)) // converts the string into a number an than into true or false
      this.editedPermission.permnegated = Boolean(parseInt(this.editedPermission.permnegated))

      this.dialog = true
    },
    savePermission() {
      this.$emit('save', this.editedPermission)
      this.dialog = false
    },
    confirmDeletion(permissionValues) {
      this.editedPermission = {
        ...permissionValues
      }

      this.deleteDialog = true
    },
    removePermission() {
      this.$emit('remove', this.editedPermission)

      this.deleteDialog = false
    }
  },
  async created() {
    try {
      this.availablePermissions = await this.getPermissionlist()

      // Emit the "loaded" event on the parent component to prevent wrong responses
      this.$emit('loaded')
    } catch (err) {
      this.$toasted.error(err.message)
    }
  }
}
</script>
