<template lang="html">
  <v-menu offset-y max-width="300px">
    <template #activator="{ on, attrs }">
      <v-list-item v-bind="attrs" v-on="on">
        <v-list-item-content>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-action>
          <v-icon>mdi-upload</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Upload File</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Create Subfolder</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :disabled="item.source.type !== 0">
        <v-list-item-action>
          <v-icon>mdi-pencil</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Rename Folder</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :disabled="item.source.type !== 0">
        <v-list-item-action>
          <v-icon>mdi-delete</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Delete Folder</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    item: Object,
  }
}
</script>

<style lang="css" scoped>
</style>
