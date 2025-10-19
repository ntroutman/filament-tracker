<template>
  <div>
    <h2>From/To Pivot Table</h2>
    
    <div v-if="store.filaments.length">
      <h3>Select Filaments (order preserved):</h3>
      <div style="margin-bottom: 20px;">
        <label v-for="filament in store.filaments" :key="filament.id" style="display: block; margin: 5px 0;">
          <input 
            type="checkbox" 
            :value="filament.id" 
            @change="toggleFilament(filament.id, $event.target.checked)"
          >
          {{ filament.brand }} {{ filament.type }} - {{ filament.color }}
        </label>
      </div>
      
      <table v-if="selectedFilaments.length >= 2">
        <thead>
          <tr>
            <th>FROM \ TO</th>
            <th v-for="toFilament in selectedFilaments" :key="toFilament.id">
              {{ toFilament.brand }} {{ toFilament.type }}<br>{{ toFilament.color }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fromFilament in selectedFilaments" :key="fromFilament.id">
            <td><strong>{{ fromFilament.brand }} {{ fromFilament.type }}<br>{{ fromFilament.color }}</strong></td>
            <td v-for="toFilament in selectedFilaments" :key="toFilament.id">
              {{ getFlushVolume(fromFilament.id, toFilament.id) }}
            </td>
          </tr>
        </tbody>
      </table>
      
      <p v-else-if="selectedFilaments.length < 2">Select at least 2 filaments to view the pivot table.</p>
    </div>
    
    <p v-else>Add filaments to the catalog first.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '../stores/filamentStore.js'

const selectedFilaments = ref([])

function toggleFilament(filamentId, checked) {
  if (checked) {
    const filament = store.getFilamentById(filamentId)
    selectedFilaments.value.push(filament)
  } else {
    selectedFilaments.value = selectedFilaments.value.filter(f => f.id !== filamentId)
  }
}

function getFlushVolume(fromId, toId) {
  if (fromId === toId) return '-'
  const volume = store.getFlushVolume(fromId, toId)
  return volume !== null ? `${volume} ml` : 'No data'
}
</script>
