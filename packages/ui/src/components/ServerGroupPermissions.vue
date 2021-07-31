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
              <v-autocomplete
                :items="groupSelection"
                v-model="selectedGroup"
                @change="changeGroup"
                label="Server Group"
                :disabled="$store.state.query.loading"
              ></v-autocomplete>
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
      servergroupId: this.$route.params.sgid,
    };
  },
  computed: {
    regularServerGroups() {
      return this.servergroups.filter((servergroup) => servergroup.type === 1);
    },
    groupSelection() {
      return this.regularServerGroups.map((servergroup) => {
        return {
          text: servergroup.name,
          value: servergroup.sgid,
        };
      });
    },
    selectedGroup: {
      get() {
        let servergroup = this.servergroups.find(
          (servergroup) => servergroup.sgid == this.servergroupId
        );

        // && to prevent "undefined" error on first load
        return (
          servergroup && {
            text: servergroup.name,
            value: servergroup.sgid,
          }
        );
      },
      set(sgid) {
        // the setter is doing nothing
        // but if it is not set there would be an error in the console
      },
    },
  },
  methods: {
    getServergroupPermissions() {
      return this.$TeamSpeak.execute("servergrouppermlist", {
        sgid: this.servergroupId,
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
        sgid: this.servergroupId,
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
        sgid: this.servergroupId,
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

        if (!this.servergroupId) {
          this.$router.replace({
            name: "permissions-servergroup",
            params: {
              sgid: this.regularServerGroups[0].sgid,
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
      this.servergroupId = to.params.sgid;
      this.serverGroupPermissions = await this.getServergroupPermissions();
    } catch (err) {
      this.$toast.error(err.message);
    }

    next();
  },
};
</script>
