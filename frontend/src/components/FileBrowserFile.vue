<template lang="html">
  <v-menu offset-y max-width="300px">
    <template #activator="{ on, attrs }">
      <v-list-item v-bind="attrs" v-on="on">
        <v-list-item-content>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ item.source.size }} Bytes
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-list>
      <v-list-item :href="href">
        <v-list-item-action>
          <v-icon>mdi-download</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Download File</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-action>
          <v-icon>mdi-delete</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Delete File</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-action>
          <v-icon>mdi-pencil</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Rename File</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    item: Object,
    href: String
  }
}
</script>

<style lang="css" scoped>
</style>
