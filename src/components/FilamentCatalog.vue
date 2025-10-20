<template>
  <div>
    <v-card class="mb-6">
      <v-card-title>Add New Filament</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="addFilament">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                  v-model="brand"
                  label="Brand (e.g., Bambu, Elegoo)"
                  required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                  v-model="type"
                  label="Type (e.g., PLA Basic, PETG)"
                  required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                  v-model="color"
                  label="Color"
                  required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                  v-model="hexColor"
                  label="Hex Color"
                  type="color"
                  required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-btn type="submit" color="primary">Add Filament</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-data-table
        v-if="store.filaments.length"
        :headers="headers"
        :items="filteredFilaments"
        :items-per-page="25"
        class="elevation-1"
    >
      <template v-slot:item.color="{ item }">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div
              :style="{
        backgroundColor: item.hexColor,
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        flexShrink: 0
      }"
          />
          <div>{{ item.color }}</div>
        </div>
      </template>
    </v-data-table>

    <v-alert v-else type="info" variant="tonal">
      No filaments added yet. Add your first filament above.
    </v-alert>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {store} from '../stores/filamentStore.js'

const brand = ref('')
const type = ref('')
const color = ref('')
const hexColor = ref('#000000')

const headers = [
  {title: 'Brand', key: 'brand'},
  {title: 'Type', key: 'type'},
  {title: 'Color', key: 'color', sortable: true}
]

const filteredFilaments = computed(() => {
  let filtered = store.filaments

  if (brand.value) {
    filtered = filtered.filter(entry => entry.brand.toLowerCase().includes(brand.value.toLowerCase()))
  }

  if (type.value) {
    filtered = filtered.filter(entry => entry.type.toLowerCase().includes(type.value.toLowerCase()))
  }

  if (color.value) {
    filtered = filtered.filter(entry => entry.color.toLowerCase().includes(color.value.toLowerCase()))
  }

  return filtered
})

function addFilament() {
  store.addFilament(brand.value, type.value, color.value, hexColor.value)
  brand.value = type.value = color.value = ''
  hexColor.value = '#000000'
}
</script>
