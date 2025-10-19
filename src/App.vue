<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>Filament Flush Volume Tracker</v-app-bar-title>
      <v-spacer></v-spacer>
      <input
        ref="csvInput"
        type="file"
        accept=".csv,.json"
        @change="importData"
        style="display: none"
      >
      <v-btn @click="$refs.csvInput.click()" variant="outlined" class="mr-2">
        <v-icon left>mdi-upload</v-icon>
        Import Data
      </v-btn>
      <v-btn @click="store.exportData()" variant="outlined">
        <v-icon left>mdi-download</v-icon>
        Export Data
      </v-btn>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-tabs v-model="currentView" color="primary" class="mb-6">
          <v-tab value="catalog">Filament Catalog</v-tab>
          <v-tab value="entry">Flush Volumes</v-tab>
          <v-tab value="pivot">Flush Table</v-tab>
        </v-tabs>
        
        <v-window v-model="currentView">
          <v-window-item value="catalog">
            <FilamentCatalog />
          </v-window-item>
          <v-window-item value="entry">
            <FlushEntry />
          </v-window-item>
          <v-window-item value="pivot">
            <PivotTable />
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { store } from './stores/filamentStore.js'
import FilamentCatalog from './components/FilamentCatalog.vue'
import FlushEntry from './components/FlushEntry.vue'
import PivotTable from './components/PivotTable.vue'

const currentView = ref('catalog')
const csvInput = ref(null)

function importData(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      if (file.name.endsWith('.json')) {
        store.importJSON(content)
      } else {
        store.importCSV(content)
      }
    }
    reader.readAsText(file)
  }
}
</script>
