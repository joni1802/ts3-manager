<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <permission-table
          :grantedPermissions="serverGroupPermissions"
          type="Server Groups"
          :editableContent="['permvalue', 'permskip', 'permnegated']"
          @save="savePermission"
          @remove="removePermission"
          @loaded="init"
        >
          <template #selectMenu>
            <v-flex sm3 xs12>
              <v-select
                :items="allGroups"
                v-model="selectedGroupId"
                @change="changeGroup"
                label="Server Group"
                :disabled="$store.state.query.loading"
                item-text="name"
                item-value="sgid"
              >
                <template #item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle
                      >({{ item.sgid }})</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </template>
              </v-select>
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
    PermissionTable: () => import("@/components/PermissionTable.vue"),
  },
  data() {
    return {
      serverGroupPermissions: [],
      servergroups: [],
      selectedGroupId: parseInt(this.$route.params.sgid),
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
      return this.servergroups.filter((group) => group.type === 1);
    },
    templateGroups() {
      return this.servergroups.filter((group) => group.type === 0);
    },
    serverQueryGroups() {
      return this.servergroups.filter((group) => group.type === 2);
    },
  },
  methods: {
    getServergroupPermissions() {
      return this.$TeamSpeak.execute("servergrouppermlist", {
        sgid: this.selectedGroupId,
      });
    },
    getServergrouplist() {
      return this.$TeamSpeak.execute("servergrouplist");
    },
    changeGroup(sgid) {
      this.$router.push({
        name: "permissions-servergroup",
        params: {
          sgid: sgid,
        },
      });
    },
    async savePermission(permissionValues) {
      let { permid, permnegated, permskip, permvalue } = permissionValues;

      let params = {
        sgid: this.selectedGroupId,
        permid: permid,
        permnegated: +permnegated, // unary + operator to convert boolean into number
        permskip: +permskip,
        permvalue: permvalue,
      };

      try {
        await this.$TeamSpeak.execute("servergroupaddperm", params);
      } catch (err) {
        this.$toast.error(err.message);
      }

      try {
        this.serverGroupPermissions = await this.getServergroupPermissions();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async removePermission(permissionValues) {
      let { permid } = permissionValues;

      let params = {
        sgid: this.selectedGroupId,
        permid: permid,
      };

      try {
        await this.$TeamSpeak.execute("servergroupdelperm", params);
      } catch (err) {
        this.$toast.error(err.message);
      }

      try {
        this.serverGroupPermissions = await this.getServergroupPermissions();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
    async init() {
      try {
        this.servergroups = await this.getServergrouplist();

        if (!this.selectedGroupId) {
          this.$router.replace({
            name: "permissions-servergroup",
            params: {
              sgid: this.servergroups[0].sgid,
            },
          });
        }

        this.serverGroupPermissions = await this.getServergroupPermissions();
      } catch (err) {
        this.$toast.error(err.message);
      }
    },
  },
  async beforeRouteUpdate(to, from, next) {
    try {
      this.selectedGroupId = parseInt(to.params.sgid);
      this.serverGroupPermissions = await this.getServergroupPermissions();
    } catch (err) {
      this.$toast.error(err.message);
    }

    next();
  },
};
</script>
