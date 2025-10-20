<template>
  <div>
    <h2>From/To Pivot Table</h2>
    
    <div v-if="store.filaments.length">
      <h3>Select Filaments:</h3>
      <div style="margin-bottom: 20px;">
        <v-combobox
          v-model="selectedFilaments"
          :items="store.filaments"
          :custom-filter="filamentFilter"
          :item-title="getFilamentDisplayName"
          label="Select filaments for pivot table"
          multiple
          chips
          closable-chips
          return-object
          :item-value="item => item"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" title="">
              <FilamentSwatch :filament="item.value"/>
            </v-list-item>
          </template>
          
          <template v-slot:chip="{ props, item }">
            <v-chip v-bind="props">
             <FilamentSwatch :filament="item.raw" single-line />
            </v-chip>
          </template>
        </v-combobox>
      </div>
      
      <table v-if="selectedFilaments.length >= 2">
        <thead>
          <tr>
            <th>FROM \ TO</th>
            <th v-for="toFilament in selectedFilaments" :key="toFilament.id" style="text-align: left; padding-left: 10px;">
              <FilamentSwatch :filament="toFilament" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fromFilament in selectedFilaments" :key="fromFilament.id">
            <td>
              <FilamentSwatch :filament="fromFilament" />
            </td>
            <td v-for="toFilament in selectedFilaments" :key="toFilament.id" style="text-align: center;">
              <span v-if="getFlushVolumeValue(fromFilament.id, toFilament.id) !== null">
                {{ getFlushVolumeValue(fromFilament.id, toFilament.id) }} ml
              </span>
              <v-btn 
                v-else-if="fromFilament.id !== toFilament.id"
                @click="openAddDialog(fromFilament, toFilament)"
                icon
                size="x-small"
                variant="outlined"
              >
                <v-icon icon="mdi-plus" size="small" />
              </v-btn>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <p v-else-if="selectedFilaments.length < 2">Select at least 2 filaments to view the pivot table.</p>
    </div>
    
    <p v-else>Add filaments to the catalog first.</p>
    
    <!-- Add Flush Data Dialog -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>Add Flush Volume</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <strong>FROM:</strong> {{ dialogData.from?.brand }} {{ dialogData.from?.type }} - {{ dialogData.from?.color }}
          </div>
          <div class="mb-4">
            <strong>TO:</strong> {{ dialogData.to?.brand }} {{ dialogData.to?.type }} - {{ dialogData.to?.color }}
          </div>
          <div class="mb-4">
            <strong>Sample ID:</strong> {{ store.nextSampleId }}
          </div>
          
          <v-select
            v-model="dialogData.retraction"
            :items="retractionOptions"
            label="Retraction"
            class="mb-4"
          ></v-select>
          
          <v-text-field
            v-model="dialogData.volume"
            type="number"
            step="0.1"
            label="Flush volume (ml)"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDialog = false">Cancel</v-btn>
          <v-btn @click="saveFlushData" color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '../stores/filamentStore.js'
import FilamentSwatch from "@/components/FilamentSwatch.vue";

const selectedFilaments = ref([])
const showDialog = ref(false)
const dialogData = ref({
  from: null,
  to: null,
  retraction: 'Long (18mm)',
  volume: ''
})

const retractionOptions = [
  { title: 'Standard', value: 'Standard' },
  { title: 'Long (18mm)', value: 'Long (18mm)' }
]

function getFilamentDisplayName(filament) {
  return `${filament.brand} ${filament.type} - ${filament.color}`
}

function filamentFilter(itemText, queryText, item) {
  if (!queryText) return true
  
  const query = new RegExp(queryText.toLowerCase().split(" ").join(".*"), "gi")
  const filament = item.raw || item
  const name = filament.brand.toLowerCase() + " " + filament.type.toLowerCase() + " " + filament.color.toLowerCase()
  return query.test(name)
}

function getFilamentSearchText(filament) {
  return `${filament.brand} ${filament.type} ${filament.color}`
}

function getFlushVolumeValue(fromId, toId) {
  return store.getFlushVolume(fromId, toId)
}

function openAddDialog(fromFilament, toFilament) {
  dialogData.value = {
    from: fromFilament,
    to: toFilament,
    retraction: 'Long (18mm)',
    volume: ''
  }
  showDialog.value = true
}

function saveFlushData() {
  const sampleId = store.addFlushData(
    dialogData.value.from.id,
    dialogData.value.to.id,
    dialogData.value.volume,
    dialogData.value.retraction
  )
  alert(`Sample added! Write ID #${sampleId} on your physical sample.`)
  showDialog.value = false
}
</script>
