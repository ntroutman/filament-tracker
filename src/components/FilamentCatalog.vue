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
      
      <template v-slot:item.actions="{ item }">
        <v-btn @click="openEditDialog(item)" icon size="small" variant="outlined" class="mr-2">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn @click="confirmDelete(item)" icon size="small" variant="outlined" color="error">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-alert v-else type="info" variant="tonal">
      No filaments added yet. Add your first filament above.
    </v-alert>
    
    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Filament</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveEdit">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.brand"
                  label="Brand"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.type"
                  label="Type"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.color"
                  label="Color"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.hexColor"
                  label="Hex Color"
                  type="color"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showEditDialog = false">Cancel</v-btn>
          <v-btn @click="saveEdit" color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          <p>Delete "{{ deleteData.filament?.brand }} {{ deleteData.filament?.type }} - {{ deleteData.filament?.color }}"?</p>
          <p v-if="deleteData.flushCount > 0" class="text-warning">
            This will also delete {{ deleteData.flushCount }} flush data entries.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn @click="deleteFilament" color="error">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {store} from '../stores/filamentStore.js'

const brand = ref('')
const type = ref('')
const color = ref('')
const hexColor = ref('#000000')

const showEditDialog = ref(false)
const editData = ref({
  id: '',
  brand: '',
  type: '',
  color: '',
  hexColor: '#000000'
})

const showDeleteDialog = ref(false)
const deleteData = ref({
  filament: null,
  flushCount: 0
})

const headers = [
  {title: 'Brand', key: 'brand'},
  {title: 'Type', key: 'type'},
  {title: 'Color', key: 'color', sortable: true},
  {title: 'Actions', key: 'actions', sortable: false}
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

function openEditDialog(filament) {
  editData.value = {
    id: filament.id,
    brand: filament.brand,
    type: filament.type,
    color: filament.color,
    hexColor: filament.hexColor
  }
  showEditDialog.value = true
}

function saveEdit() {
  store.editFilament(
    editData.value.id,
    editData.value.brand,
    editData.value.type,
    editData.value.color,
    editData.value.hexColor
  )
  showEditDialog.value = false
}

function confirmDelete(filament) {
  const flushCount = store.flushData.filter(f => f.fromId === filament.id || f.toId === filament.id).length
  deleteData.value = {
    filament,
    flushCount
  }
  showDeleteDialog.value = true
}

function deleteFilament() {
  store.deleteFilament(deleteData.value.filament.id)
  showDeleteDialog.value = false
}
</script>
