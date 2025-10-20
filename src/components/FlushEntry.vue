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
                :items="store.filaments"
                :item-title="getFilamentSearchText"
                item-value="id"
                label="FROM filament"
                clearable
                required
                chips
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" title="" v-if="item && item.raw">
                    <FilamentSwatch :filament="item.raw"/>
                  </v-list-item>
                </template>

                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" v-if="item && item.value">
                   <FilamentSwatch :filament="store.getFilamentById(item.value)" single-line />
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="toId"
                :items="store.filaments"
                :item-title="getFilamentSearchText"
                item-value="id"
                label="TO filament"
                clearable
                required
                chips
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" tile="">
                    <FilamentSwatch :filament="item.raw"/>
                  </v-list-item>
                </template>

                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" v-if="item && item.value">
                   <FilamentSwatch :filament="store.getFilamentById(item.value)" single-line />
                  </v-chip>
                </template>
              </v-autocomplete>
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
        <FilamentSwatch :filament="item.from" />
      </template>

      <template v-slot:item.to="{ item }">
        <FilamentSwatch :filament="item.to" />
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../stores/filamentStore.js'
import FilamentSwatch from './FilamentSwatch.vue'

const fromId = ref(null)
const toId = ref(null)
const volume = ref('')
const retraction = ref('Long (18mm)')

const retractionOptions = [
  { title: 'Standard', value: 'Standard' },
  { title: 'Long (18mm)', value: 'Long (18mm)' }
]

function getFilamentSearchText(filament) {
  return `${filament.brand} ${filament.type} ${filament.color}`
}

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
  fromId.value = toId.value = null
  volume.value = ''
  retraction.value = 'Long (18mm)'
}

</script>
