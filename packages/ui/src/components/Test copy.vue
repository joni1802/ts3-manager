<template>
  <v-container>
    <v-card>
      <v-card-title>Groups</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Users</v-list-item-title>
                </v-list-item-content>
                <!-- <v-list-item-action>
                  <v-menu>
                    <template #activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title> Add to Group </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-list-item-action> -->
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item-group v-model="selection" multiple>
                <v-list-item v-for="(group, index) in groups" :key="index">
                  <template #default="{ active }">
                    <v-list-item-action>
                      <v-checkbox :input-value="active"> </v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ group }}</v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-col>
          <div class="d-flex flex-column justify-center">
            <v-btn icon :disabled="!selection"
              ><v-icon>mdi-chevron-right</v-icon></v-btn
            >
            <v-btn icon :disabled="!selection2"
              ><v-icon>mdi-chevron-left</v-icon></v-btn
            >
          </div>
          <!-- <v-divider vertical></v-divider>
          
          <v-divider vertical></v-divider> -->
          <v-col>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Members</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item-group v-model="selection2" multiple>
                <v-list-item v-for="(group, index) in groups2" :key="index">
                  <template #default="{ active }">
                    <v-list-item-action>
                      <v-checkbox :input-value="active"> </v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ group }}</v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      groups: ["Stuff", "Yolo", "Normal"],
      groups2: ["Jaja"],
      selection: [],
      selection2: [],
    };
  },
  methods: {},
};
</script>
