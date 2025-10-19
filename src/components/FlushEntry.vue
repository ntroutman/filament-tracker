<template>
  <div>
    <v-card class="mb-6">
      <v-card-title>Add Flush Volume Data</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="addFlushData" v-if="store.filaments.length >= 2">
          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="fromId"
                :items="filamentOptions"
                label="FROM filament"
                clearable
                required
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="toId"
                :items="filamentOptions"
                label="TO filament"
                clearable
                required
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="volume"
                type="number"
                step="0.1"
                label="Flush volume (ml)"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="retraction"
                :items="retractionOptions"
                label="Retraction"
                required
              ></v-select>
            </v-col>
          </v-row>
          <v-btn type="submit" color="primary">Add Flush Data</v-btn>
        </v-form>
        
        <v-alert v-else type="info" variant="tonal">
          Add at least 2 filaments to the catalog first.
        </v-alert>
      </v-card-text>
    </v-card>
    
    <v-data-table
      v-if="store.flushData.length"
      :headers="headers"
      :items="flushDataWithFilaments"
      :items-per-page="25"
      class="elevation-1"
    >
      <template v-slot:item.from="{ item }">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div
              :style="{ backgroundColor: item.from.hexColor, width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #ccc' }"
          ></div>
          {{ item.from.brand }} - {{item.from.type}} - {{item.from.color}}
        </div>
      </template>

      <template v-slot:item.to="{ item }">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div
              :style="{ backgroundColor: item.to.hexColor, width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #ccc' }"
          ></div>
          {{ item.to.brand }} - {{item.to.type}} - {{item.to.color}}
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../stores/filamentStore.js'

const fromId = ref('')
const toId = ref('')
const volume = ref('')
const retraction = ref('Long (18mm)')

const retractionOptions = [
  { title: 'Standard', value: 'Standard' },
  { title: 'Long (18mm)', value: 'Long (18mm)' }
]

const filamentOptions = computed(() => 
  store.filaments.map(f => ({
    title: `${f.brand} ${f.type} - ${f.color}`,
    value: f.id
  }))
)

const headers = [
  { title: 'Sample ID', key: 'sampleId' },
  { title: 'From', key: 'from' },
  { title: 'To', key: 'to' },
  { title: 'Volume (ml)', key: 'volume' },
  { title: 'Retraction', key: 'retraction' }
]

const flushDataWithFilaments = computed(() => {
  let filtered = store.flushData
  
  // Filter by FROM filament if selected
  if (fromId.value) {
    filtered = filtered.filter(entry => entry.fromId === fromId.value)
  }
  
  // Filter by TO filament if selected
  if (toId.value) {
    filtered = filtered.filter(entry => entry.toId === toId.value)
  }
  
  return filtered.map(entry => ({
    sampleId: entry.sampleId,
    from: store.getFilamentById(entry.fromId),
    to: store.getFilamentById(entry.toId),
    volume: entry.volume,
    retraction: entry.retraction
  }))
})

function addFlushData() {
  const sampleId = store.addFlushData(fromId.value, toId.value, volume.value, retraction.value)
  alert(`Sample added! Write ID #${sampleId} on your physical sample.`)
  fromId.value = toId.value = volume.value = ''
  retraction.value = 'Long (18mm)'
}

</script>
