<template>
  <v-container>
    <v-layout>
      <v-flex md6 sm8 xs12 offset-md3 offset-sm2>
        <v-card>
          <v-list>
            <v-list-item v-for="group in groups" :key="group[Object.keys(group)[0]]">
              <v-list-item-content>
                <v-list-item-title>{{ group.name }}</v-list-item-title>
                <v-list-item-subtitle>({{ group[Object.keys(group)[0]] }})</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon ripple @click="editGroup(group)">
                  <v-icon>edit</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon ripple @click="confirmDeletion(group)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-flex>
      <v-btn fab color="primary" fixed bottom right dark @click="addDialog = true">
        <v-icon>add</v-icon>
      </v-btn>
      <v-dialog v-model="removeDialog" max-width="500px">
        <v-card>
          <v-card-title>
            Confirm Delete Group
          </v-card-title>
          <v-card-text>
            Please confirm deleting the group <b>{{ selectedGroup.name }}</b>
            <v-checkbox v-model="forceDeletion" label="Delete even if there are clients in the group"></v-checkbox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="removeDialog = false">Abort</v-btn>
            <v-btn text color="primary" @click="removeGroup">Delete Group</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="addDialog" max-width="500px">
        <v-card>
          <v-card-title>
            Add Group
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="groupName" label="Group Name"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="addGroup">Add</v-btn>
            <v-btn text color="primary" @click="addDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    props: {
      groups: Array,
    },
    data() {
      return {
        removeDialog: false,
        addDialog: false,
        groupName: '',
        selectedGroup: {},
        forceDeletion: false // Delete group even if there are clients
      }
    },
    methods: {
      confirmDeletion(group) {
        this.selectedGroup = group
        this.removeDialog = true
      },
      removeGroup() {
        this.$emit('remove', this.selectedGroup, this.forceDeletion)
        this.removeDialog = false
      },
      addGroup() {
        this.$emit('add', this.groupName)
        this.groupName = ''
        this.addDialog = false
      },
      editGroup(group) {
        this.$emit('edit', group)
      }
    }

  }
</script>
