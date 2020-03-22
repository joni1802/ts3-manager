<template>
  <v-container>
    <v-layout justify-center>
      <v-flex lg6 md8 sm8 xs12>
        <v-card>
          <v-card-title>
            Create Server
          </v-card-title>
          <v-card-text>
            <!-- <v-select :items="tokenTypes" label="Type" v-model="selectedType" :disabled="$store.state.query.loading"></v-select>
            <v-autocomplete :items="availableGroups" label="Group" v-model="selectedGroup" :disabled="typeof selectedType === 'undefined' || $store.state.query.loading"></v-autocomplete>
            <v-autocomplete :items="availableChannels" label="Channel" v-model="selectedChannel" :disabled="selectedType === 0 || typeof selectedType === 'undefined' || $store.state.query.loading"></v-autocomplete>
            <v-textarea label="Description" v-model="tokenDescription"></v-textarea>
            <v-text-field class="mt-5" label="Generated Privilege Key" v-model="token" readonly :append-icon="token && 'mdi-content-copy'" @click:append="copyToClipboard"></v-text-field> -->
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="" color="primary">Create</v-btn>
            <v-btn flat @click="$router.go(-1)" color="primary">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
}
</script>
