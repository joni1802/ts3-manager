<template>
  <v-card outlined :disabled="disabled">
    <v-card-subtitle>Members</v-card-subtitle>

    <v-card-text>
      <v-text-field
        label="Filter"
        v-model="clientGroupListFilter"
      ></v-text-field>
      <v-list height="400" class="overflow-y-auto">
        <v-list-item-group v-model="removeSelection" multiple>
          <v-list-item
            v-for="client in clientGroupList"
            :key="client.cldbid"
            :value="client.cldbid"
          >
            <template #default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active"> </v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ client.clientNickname }} ({{ client.cldbid }})
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ client.clientUniqueIdentifier }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-dialog v-model="addDialog" max-width="500px">
        <template #activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" color="primary">
            <v-icon left>add</v-icon>Add
          </v-btn>
        </template>
        <v-card>
          <v-card-title>Clients</v-card-title>
          <v-card-text>
            <v-text-field
              label="Filter"
              v-model="availableClientsFilter"
            ></v-text-field>
            <v-list height="400px" class="overflow-y-auto">
              <v-list-item-group v-model="addSelection" multiple>
                <v-list-item
                  v-for="client in availableClients"
                  :key="client.cldbid"
                  :value="client.cldbid"
                >
                  <template #default="{ active }">
                    <v-list-item-action>
                      <v-checkbox :input-value="active"> </v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ client.clientNickname }} ({{ client.cldbid }})
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ client.clientUniqueIdentifier }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              @click="addClients"
              :disabled="!addSelection.length"
              >Add</v-btn
            >
            <v-btn text color="primary" @click="addDialog = false"
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-btn
        color="error"
        :disabled="!removeSelection.length"
        class="ml-2"
        @click="removeClients"
      >
        <v-icon left>delete</v-icon>Remove
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: {
    /**
     * Ids of the clients which are member of the server or channel group.
     * @type {{cldbid: Number}[]}
     */
    value: Array,
    clientDbList: Array,
    disabled: Boolean,
  },
  data() {
    return {
      removeSelection: [],
      addSelection: [],
      addDialog: false,
      clientGroupListFilter: "",
      availableClientsFilter: "",
    };
  },
  computed: {
    availableClients() {
      let regex = new RegExp(
        this.escapeRegex(this.availableClientsFilter),
        "i"
      );

      return this.clientDbList.filter((dbClient) => {
        return (
          !this.value.find((client) => client.cldbid === dbClient.cldbid) &&
          regex.test(dbClient.clientNickname)
        );
      });
    },
    clientGroupList() {
      let regex = new RegExp(this.escapeRegex(this.clientGroupListFilter), "i");

      return this.clientDbList.filter((dbClient) => {
        return (
          this.value.find(({ cldbid }) => cldbid === dbClient.cldbid) &&
          regex.test(dbClient.clientNickname)
        );
      });
    },
  },
  methods: {
    removeClients() {
      let clients = this.value.filter(
        ({ cldbid }) => !this.removeSelection.includes(cldbid)
      );

      this.$emit("input", clients);
    },
    addClients() {
      let clients = this.value;

      clients.push(...this.addSelection.map((cldbid) => ({ cldbid })));

      this.$emit("input", clients);

      this.addDialog = false;
    },
    escapeRegex(string) {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    },
  },
};
</script>
