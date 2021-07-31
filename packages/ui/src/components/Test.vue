<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="6">
        <v-card>
          <v-card-title>Group Edit</v-card-title>
          <v-card-text>
            <v-card outlined>
              <v-card-subtitle>Members</v-card-subtitle>

              <v-card-text>
                <v-text-field label="Filter"></v-text-field>
                <v-list>
                  <v-list-item-group v-model="selectedMembers" multiple>
                    <v-list-item
                      v-for="member in members"
                      :key="member.name"
                      :value="member"
                    >
                      <template #default="{ active }">
                        <v-list-item-action>
                          <v-checkbox :input-value="active"> </v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                          <v-list-item-title>{{
                            member.name
                          }}</v-list-item-title>
                        </v-list-item-content>
                      </template>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary"><v-icon left>add</v-icon>Add</v-btn>
                <v-btn
                  color="error"
                  :disabled="!selectedMembers.length"
                  @click="removeDialog = !removeDialog"
                >
                  <v-icon left>delete</v-icon>Remove
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary">OK</v-btn>
            <v-btn text @click="$router.go(-1)" color="primary">Cancel</v-btn>
            <v-btn text color="primary">Apply</v-btn>
          </v-card-actions>
        </v-card>

        <v-dialog v-model="removeDialog" max-width="500px">
          <v-card>
            <v-card-title>Delete Members(s)</v-card-title>
            <v-card-text>
              Do you really want to delete all selected users from this group?
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="primary">Yes</v-btn>
              <v-btn text color="primary">No</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      members: [{ name: "sven" }, { name: "peter" }],
      selectedMembers: [],
      removeDialog: false,
    };
  },
  methods: {},
};
</script>
