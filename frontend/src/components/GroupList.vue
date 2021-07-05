<template>
  <v-container>
    <v-layout>
      <v-flex md6 sm8 xs12 offset-md3 offset-sm2>
        <v-card>
          <v-list>
            <template v-if="regularGroups.length">
              <v-subheader>Regular Groups</v-subheader>
              <v-list-item
                v-for="regularGroup in regularGroups"
                :key="regularGroup.sgid || regularGroup.cgid"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ regularGroup.name }}</v-list-item-title>
                  <v-list-item-subtitle
                    >({{
                      regularGroup.sgid || regularGroup.cgid
                    }})</v-list-item-subtitle
                  >
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon ripple @click="editGroup(regularGroup)">
                    <v-icon>edit</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon ripple @click="confirmDeletion(regularGroup)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>

              <v-divider></v-divider>
            </template>

            <template v-if="templateGroups.length">
              <v-subheader>Template Groups</v-subheader>
              <v-list-item
                v-for="templateGroup in templateGroups"
                :key="templateGroup.sgid || templateGroup.cgid"
              >
                <v-list-item-content>
                  <v-list-item-title>{{
                    templateGroup.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle
                    >({{
                      templateGroup.sgid || templateGroup.cgid
                    }})</v-list-item-subtitle
                  >
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon ripple @click="editGroup(templateGroup)">
                    <v-icon>edit</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon ripple @click="confirmDeletion(templateGroup)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </template>

            <template v-if="serverQueryGroups.length">
              <v-divider></v-divider>

              <v-subheader>ServerQuery Groups</v-subheader>
              <v-list-item
                v-for="serverQueryGroup in serverQueryGroups"
                :key="serverQueryGroup.sgid || serverQueryGroup.cgid"
              >
                <v-list-item-content>
                  <v-list-item-title>{{
                    serverQueryGroup.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle
                    >({{
                      serverQueryGroup.sgid || serverQueryGroup.cgid
                    }})</v-list-item-subtitle
                  >
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon ripple @click="editGroup(serverQueryGroup)">
                    <v-icon>edit</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon ripple @click="confirmDeletion(serverQueryGroup)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-btn
        fab
        color="primary"
        fixed
        bottom
        right
        dark
        @click="addDialog = true"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-dialog v-model="removeDialog" max-width="500px">
        <v-card>
          <v-card-title> Confirm Delete Group </v-card-title>
          <v-card-text>
            Please confirm deleting the group <b>{{ selectedGroup.name }}</b>
            <v-checkbox
              v-model="forceDeletion"
              label="Delete even if there are clients in the group"
            ></v-checkbox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="removeDialog = false"
              >Abort</v-btn
            >
            <v-btn text color="primary" @click="removeGroup"
              >Delete Group</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="addDialog" max-width="500px">
        <v-card>
          <v-card-title> Add Group </v-card-title>
          <v-card-text>
            <v-text-field v-model="groupName" label="Group Name"></v-text-field>
            <v-select
              label="Group Type"
              :items="groupTypes"
              v-model="selectedGroupType"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="addGroup">Add</v-btn>
            <v-btn text color="primary" @click="addDialog = false"
              >Cancel</v-btn
            >
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
      groupName: "",
      selectedGroup: {},
      forceDeletion: false, // Delete group even if there are clients
      selectedGroupType: 1,
      groupTypes: [
        { text: "Regular Group", value: 1 },
        { text: "Template Group", value: 0 },
        { text: "ServerQuery Group", value: 2 },
      ],
    };
  },
  computed: {
    regularGroups() {
      return this.groups.filter((group) => group.type === 1);
    },
    templateGroups() {
      return this.groups.filter((group) => group.type === 0);
    },
    serverQueryGroups() {
      return this.groups.filter((group) => group.type === 2);
    },
  },
  methods: {
    confirmDeletion(group) {
      this.selectedGroup = group;
      this.removeDialog = true;
    },
    removeGroup() {
      this.$emit("remove", this.selectedGroup, this.forceDeletion);
      this.removeDialog = false;
    },
    addGroup() {
      this.$emit("add", this.groupName, this.selectedGroupType);
      this.groupName = "";
      this.addDialog = false;
    },
    editGroup(group) {
      this.$emit("edit", group);
    },
  },
};
</script>
