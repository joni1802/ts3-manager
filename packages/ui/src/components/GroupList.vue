<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="8" lg="6" xl="4">
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
                  <v-list-item-subtitle>
                    ({{ regularGroup.sgid || regularGroup.cgid }})
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-menu>
                    <template #activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="editGroup(regularGroup)">
                        <v-list-item-title> Edit Group </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openCopyDialog(regularGroup)">
                        <v-list-item-title> Copy Group </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="confirmDeletion(regularGroup)">
                        <v-list-item-title> Delete Group </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
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
                  <v-menu>
                    <template #activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="editGroup(templateGroup)">
                        <v-list-item-title> Edit Group </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openCopyDialog(templateGroup)">
                        <v-list-item-title> Copy Group </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="confirmDeletion(templateGroup)">
                        <v-list-item-title> Delete Group </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
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
                  <v-menu>
                    <template #activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="editGroup(serverQueryGroup)">
                        <v-list-item-title> Edit Group </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openCopyDialog(serverQueryGroup)">
                        <v-list-item-title> Copy Group </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="confirmDeletion(serverQueryGroup)">
                        <v-list-item-title> Delete Group </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-col>
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
      <v-dialog v-model="copyDialog" max-width="500px">
        <v-card>
          <v-card-title>Copy Group</v-card-title>
          <v-card-text>
            <v-select
              label="Copy Group"
              :items="allGroups"
              v-model="selectedGroup"
              :item-disabled="disabledSourceGroup"
              return-object
              :item-value="allGroups[0].sgid ? 'sgid' : 'cgid'"
              item-text="name"
            >
              <template #item="{ item }">
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    ({{ item.sgid || item.cgid }})
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-select>
            <v-row class="px-3">
              <v-checkbox
                label="Overwrite"
                hide-details
                class="mr-3 shrink"
                v-model="overwriteGroup"
              ></v-checkbox>
              <v-select
                label="Target Group"
                :disabled="!overwriteGroup"
                :items="allGroups"
                item-text="name"
                :item-disabled="disabledTargetGroup"
                return-object
                :item-value="allGroups[0].sgid ? 'sgid' : 'cgid'"
                v-model="selectedTargetGroup"
              >
                <template #item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      ({{ item.sgid || item.cgid }})
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-select>
            </v-row>
            <v-text-field
              label="Target Group Name"
              :disabled="overwriteGroup"
              v-model="targetGroupName"
              autofocus
            ></v-text-field>
            <v-select
              label="Target Group Type"
              :items="groupTypes"
              v-model="selectedTargetGroupType"
              :disabled="overwriteGroup"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="copyGroup">OK</v-btn>
            <v-btn text color="primary" @click="copyDialog = false"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
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
      copyDialog: false,
      groupName: "",
      selectedGroup: {},
      forceDeletion: false, // Delete group even if there are clients
      selectedGroupType: 1,
      groupTypes: [
        { text: "Regular Group", value: 1 },
        { text: "Template Group", value: 0 },
        { text: "ServerQuery Group", value: 2 },
      ],
      overwriteGroup: false,
      selectedTargetGroup: {},
      selectedTargetGroupType: 1,
      targetGroupName: "",
    };
  },
  computed: {
    allGroups() {
      return [
        { header: "Regular Groups" },
        ...this.regularGroups,
        { divider: true },
        { header: "Template Groups" },
        ...this.templateGroups,
        { divider: true },
        { header: "ServerQuery Groups" },
        ...this.serverQueryGroups,
      ];
    },
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
    openCopyDialog(group) {
      this.selectedGroup = group;
      this.copyDialog = true;
      this.overwriteGroup = false;
    },
    copyGroup() {
      this.$emit(
        "copy",
        this.selectedGroup,
        this.selectedTargetGroup,
        this.targetGroupName,
        this.overwriteGroup,
        this.selectedTargetGroupType
      );
      this.copyDialog = false;
    },
    disabledSourceGroup(group) {
      return (
        (group.sgid && group.sgid === this.selectedTargetGroup.sgid) ||
        (group.cgid && group.cgid === this.selectedTargetGroup.cgid)
      );
    },
    disabledTargetGroup(group) {
      return (
        (group.sgid && group.sgid === this.selectedGroup.sgid) ||
        (group.cgid && group.cgid === this.selectedGroup.cgid)
      );
    },
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
    getGroupType(type) {
      switch (type) {
        case 0:
          return "Template Group";
        case 1:
          return "Regular Group";
        case 2:
          return "ServerQuery Group";
      }
    },
  },
  watch: {
    selectedTargetGroup(group) {
      this.targetGroupName = group.name;
      this.selectedTargetGroupType = group.type;
    },
    overwriteGroup(overwrite) {
      if (overwrite) {
        this.targetGroupName = this.selectedTargetGroup.name;
        this.selectedTargetGroupType = this.selectedTargetGroup.type;
      }
    },
  },
};
</script>
