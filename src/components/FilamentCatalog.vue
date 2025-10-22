<template>
  <div>
    <!-- Add Filament Card -->
    <v-card class="mb-6">
      <v-card-title>Add New Filament</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="addFilament">
          <v-row>
            <v-col cols="12" md="3">
              <v-combobox
                  v-model="brand"
                  :items="uniqueBrands"
                  label="Brand (e.g., Bambu, Elegoo)"
                  required
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="3">
              <v-combobox
                  v-model="type"
                  :items="uniqueTypes"
                  label="Type (e.g., PLA Basic, PETG)"
                  required
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="3">
              <v-combobox
                  v-model="color"
                  :items="uniqueColors"
                  label="Color"
                  required
              ></v-combobox>
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

    <!-- Filament List Table -->
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
      
      <template v-slot:item.rolls="{ item }">
        <div>
          {{ item.purchases.map(p => p.rolls).reduce((a, v) => a + v, 0) }}
        </div>
      </template>
      
      <template v-slot:item.actions="{ item }">
        <v-btn @click="openDetailsDialog(item)" icon="mdi-eye" size="xsmall" variant="plain" class="mr-2" />
        <v-btn @click="confirmDelete(item)" icon="mdi-delete" size="xsmall" variant="plain" color="error" />
      </template>
    </v-data-table>

    <v-alert v-else type="info" variant="tonal">
      No filaments added yet. Add your first filament above.
    </v-alert>
    
    <!-- Filament Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="700px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ detailsData.brand }} {{ detailsData.type }} - {{ detailsData.color }}</span>
          <v-btn @click="toggleEditMode" icon variant="text">
            <v-icon>{{ isEditMode ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <!-- Filament Info Section -->
          <v-row v-if="isEditMode">
            <v-col cols="12" md="6">
              <v-text-field v-model="detailsData.brand" label="Brand" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="detailsData.type" label="Type" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="detailsData.color" label="Color" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="detailsData.hexColor" label="Hex Color" type="color" required></v-text-field>
            </v-col>
          </v-row>
          
          <div v-else class="mb-4">
            <div class="d-flex align-center gap-3 mb-2">
              <div :style="{ backgroundColor: detailsData.hexColor, width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc' }"></div>
              <div>
                <div class="text-h6">{{ detailsData.brand }} {{ detailsData.type }}</div>
                <div class="text-subtitle-1">{{ detailsData.color }}</div>
              </div>
            </div>
          </div>
          
          <!-- Purchases Section -->
          <v-divider class="my-4"></v-divider>
          <div class="d-flex justify-space-between align-center mb-3">
            <h3>Purchase History</h3>
            <v-btn @click="openPurchaseDialog" color="primary" size="small">
              <v-icon left>mdi-plus</v-icon>
              Add Purchase
            </v-btn>
          </div>
          
          <v-data-table
            v-if="detailsData.purchases?.length"
            :headers="purchaseHeaders"
            :items="detailsData.purchases"
            :items-per-page="5"
            class="elevation-1"
          >
            <template v-slot:item.date="{ item }">
              {{ new Date(item.date).toLocaleDateString() }}
            </template>
            <template v-slot:item.price="{ item }">
              ${{ item.price.toFixed(2) }}
            </template>
          </v-data-table>
          
          <v-alert v-else type="info" variant="tonal" class="mt-2">
            No purchases recorded yet.
          </v-alert>
          
          <!-- Summary -->
          <v-divider class="my-4"></v-divider>
          <div class="d-flex justify-space-around text-center">
            <div>
              <div class="text-h6">{{ totalRolls }}</div>
              <div class="text-caption">Total Rolls</div>
            </div>
            <div>
              <div class="text-h6">${{ totalSpent.toFixed(2) }}</div>
              <div class="text-caption">Total Spent</div>
            </div>
            <div>
              <div class="text-h6">{{ detailsData.purchases?.length || 0 }}</div>
              <div class="text-caption">Purchases</div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDetailsDialog = false">Close</v-btn>
          <v-btn v-if="isEditMode" @click="saveEdit" color="primary">Save Changes</v-btn>
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
    
    <!-- Add Purchase Dialog -->
    <v-dialog v-model="showPurchaseDialog" max-width="400px">
      <v-card>
        <v-card-title>Add Purchase</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <strong>{{ purchaseData.filament?.brand }} {{ purchaseData.filament?.type }} - {{ purchaseData.filament?.color }}</strong>
          </div>
          
          <v-text-field
            v-model="purchaseData.date"
            type="date"
            label="Purchase Date"
            required
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="purchaseData.rolls"
            type="number"
            min="1"
            label="Number of Rolls"
            required
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="purchaseData.price"
            type="number"
            step="0.01"
            label="Total Price"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showPurchaseDialog = false">Cancel</v-btn>
          <v-btn @click="savePurchase" color="primary">Save</v-btn>
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

const showDetailsDialog = ref(false)
const isEditMode = ref(false)
const detailsData = ref({
  id: '',
  brand: '',
  type: '',
  color: '',
  hexColor: '#000000',
  purchases: []
})

const purchaseHeaders = [
  { title: 'Date', key: 'date' },
  { title: 'Rolls', key: 'rolls' },
  { title: 'Price', key: 'price' }
]

const totalRolls = computed(() => 
  detailsData.value.purchases?.reduce((sum, p) => sum + p.rolls, 0) || 0
)

const totalSpent = computed(() => 
  detailsData.value.purchases?.reduce((sum, p) => sum + p.price, 0) || 0
)

const showDeleteDialog = ref(false)
const deleteData = ref({
  filament: null,
  flushCount: 0
})

const showPurchaseDialog = ref(false)
const purchaseData = ref({
  filament: null,
  date: new Date().toISOString().split('T')[0],
  rolls: 1,
  price: ''
})

const headers = [
  {title: 'Brand', key: 'brand'},
  {title: 'Type', key: 'type'},
  {title: 'Color', key: 'color', sortable: true},
  {title: 'Rolls', key: 'rolls', sortable: false},
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

const uniqueBrands = computed(() => 
  [...new Set(store.filaments.map(f => f.brand))].sort()
)

const uniqueTypes = computed(() => 
  [...new Set(store.filaments.map(f => f.type))].sort()
)

const uniqueColors = computed(() => 
  [...new Set(store.filaments.map(f => f.color))].sort()
)

function addFilament() {
  const filamentId = store.addFilament(brand.value, type.value, color.value, hexColor.value)
  brand.value = type.value = color.value = ''
  hexColor.value = '#000000'
  
  // Open details dialog for the newly added filament
  const newFilament = store.getFilamentById(filamentId)
  if (newFilament) {
    openDetailsDialog(newFilament)
  }
}

function openDetailsDialog(filament) {
  detailsData.value = {
    id: filament.id,
    brand: filament.brand,
    type: filament.type,
    color: filament.color,
    hexColor: filament.hexColor,
    purchases: [...(filament.purchases || [])]
  }
  isEditMode.value = false
  showDetailsDialog.value = true
}

function toggleEditMode() {
  isEditMode.value = !isEditMode.value
}

function saveEdit() {
  store.editFilament(
    detailsData.value.id,
    detailsData.value.brand,
    detailsData.value.type,
    detailsData.value.color,
    detailsData.value.hexColor
  )
  isEditMode.value = false
  // Refresh the dialog data
  const updatedFilament = store.getFilamentById(detailsData.value.id)
  if (updatedFilament) {
    detailsData.value = {
      ...detailsData.value,
      brand: updatedFilament.brand,
      type: updatedFilament.type,
      color: updatedFilament.color,
      hexColor: updatedFilament.hexColor
    }
  }
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

function openPurchaseDialog() {
  const filament = store.getFilamentById(detailsData.value.id)
  purchaseData.value = {
    filament,
    date: new Date().toISOString().split('T')[0],
    rolls: 1,
    price: ''
  }
  showPurchaseDialog.value = true
}

function savePurchase() {
  store.addPurchase(
    purchaseData.value.filament.id,
    purchaseData.value.date,
    purchaseData.value.rolls,
    purchaseData.value.price
  )

  // Refresh the details dialog data
  const updatedFilament = store.getFilamentById(detailsData.value.id)
  if (updatedFilament) {
    detailsData.value.purchases = [...updatedFilament.purchases]
  }
  showPurchaseDialog.value = false
}

</script>
