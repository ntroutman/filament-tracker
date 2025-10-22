import { reactive } from 'vue'

const STORAGE_KEY = 'filament-data'

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    filaments: store.filaments,
    flushData: store.flushData,
    nextSampleId: store.nextSampleId
  }))
}

export const store = reactive({
  filaments: [],
  flushData: [],
  nextSampleId: 1,
  
  addFilament(brand, type, color, hexColor = '#000000') {
    const id = `${brand}-${type}-${color}`
    this.filaments.push({ id, brand, type, color, hexColor, purchases: [] })
    saveToStorage()
    return id
  },
  
  addPurchase(filamentId, date, rolls, price) {
    const filament = this.getFilamentById(filamentId)
    if (filament) {
      const purchaseId = Date.now().toString()

      // purchases were added after some data was already loaded, migrate in place
      if (!filament.purchases) {
        filament.purchases = []
      }

      filament.purchases.push({ id: purchaseId, date, rolls: Number(rolls), price: Number(price) })
      saveToStorage()
      return purchaseId
    }
  },
  
  deletePurchase(filamentId, purchaseId) {
    const filament = this.getFilamentById(filamentId)
    if (filament && filament.purchases) {
      filament.purchases = filament.purchases.filter(p => p.id !== purchaseId)
      saveToStorage()
    }
  },
  
  editFilament(id, brand, type, color, hexColor) {
    const filament = this.getFilamentById(id)
    if (filament) {
      filament.brand = brand
      filament.type = type
      filament.color = color
      filament.hexColor = hexColor
      saveToStorage()
    }
  },
  
  deleteFilament(id) {
    this.filaments = this.filaments.filter(f => f.id !== id)
    // Also remove any flush data for this filament
    this.flushData = this.flushData.filter(f => f.fromId !== id && f.toId !== id)
    saveToStorage()
  },
  
  addFlushData(fromId, toId, volume, retraction = 'Long (18mm)') {
    const sampleId = this.nextSampleId++
    this.flushData.push({ sampleId, fromId, toId, volume: Number(volume), retraction })
    saveToStorage()
    return sampleId
  },
  
  getFilamentById(id) {
    return this.filaments.find(f => f.id === id)
  },
  
  getFlushVolume(fromId, toId) {
    const entry = this.flushData.find(f => f.fromId === fromId && f.toId === toId)
    return entry ? entry.volume : null
  },
  
  exportData() {
    const data = {
      filaments: this.filaments,
      flushData: this.flushData,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `filament-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  },
  
  importCSV(csvText) {
    try {
      const lines = csvText.trim().split('\n')
      if (lines.length < 2) return
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const headerLower = headers.map(h => h.toLowerCase())
      
      if (headerLower.includes('filament') && headerLower.includes('color')) {
        this.importFilamentTable(lines, headers)
      } else if ((headerLower.includes('sample_id') || headerLower.includes('sample id')) && headerLower.includes('volume')) {
        this.importFlushTable(lines, headers)
      }
      saveToStorage()
    } catch (error) {
      console.error('CSV import error:', error)
      alert('Error importing CSV. Please check the file format.')
    }
  },
  
  importFilamentTable(lines, headers) {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      
      const filament = this.parseFilament(row.Filament)
      if (filament) {
        this.addFilamentIfNotExists(
          filament.brand, 
          filament.type, 
          filament.color, 
          row.Color || '#000000'
        )
      }
    }
  },
  
  importFlushTable(lines, headers) {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      // Skip empty rows
      if (!row.TO || !row.FROM || !row.Volume) continue
      
      const toFilament = this.parseFilament(row.TO)
      const fromFilament = this.parseFilament(row.FROM)
      
      if (toFilament && fromFilament) {
        // Add filaments if they don't exist
        this.addFilamentIfNotExists(toFilament.brand, toFilament.type, toFilament.color)
        this.addFilamentIfNotExists(fromFilament.brand, fromFilament.type, fromFilament.color)
        
        // Add flush data
        const fromId = `${fromFilament.brand}-${fromFilament.type}-${fromFilament.color}`
        const toId = `${toFilament.brand}-${toFilament.type}-${toFilament.color}`
        const sampleId = parseInt(row.sample_id) || this.nextSampleId++
        const volume = parseFloat(row.Volume)
        
        // Only add if volume is valid
        if (!isNaN(volume)) {
          this.flushData.push({ 
            sampleId, 
            fromId, 
            toId, 
            volume, 
            retraction: row.retraction || 'Long (18mm)' 
          })
          // Update nextSampleId to be higher than any imported ID
          if (sampleId >= this.nextSampleId) {
            this.nextSampleId = sampleId + 1
          }
        }
      }
    }
  },
  
  importJSON(jsonText) {
    try {
      const data = JSON.parse(jsonText)
      
      if (data.filaments && Array.isArray(data.filaments)) {
        // Clear existing data and import
        this.filaments.length = 0
        this.flushData.length = 0
        
        // Import filaments
        this.filaments.push(...data.filaments)
        
        // Import flush data
        if (data.flushData && Array.isArray(data.flushData)) {
          this.flushData.push(...data.flushData)
        }
        
        // Update next sample ID
        if (data.nextSampleId) {
          this.nextSampleId = data.nextSampleId
        } else if (this.flushData.length > 0) {
          // Calculate next ID from existing data
          const maxId = Math.max(...this.flushData.map(f => f.sampleId || 0))
          this.nextSampleId = maxId + 1
        }
        
        saveToStorage()
        
        // Show success message
        alert(`Import successful!\n${this.filaments.length} filaments loaded\n${this.flushData.length} flush entries loaded`)
      } else {
        alert('Import failed: Invalid JSON format - missing filaments array')
      }
    } catch (error) {
      console.error('JSON import error:', error)
      alert('Import failed: Invalid JSON file format')
    }
  },
  
  parseFilament(filamentString) {
    if (!filamentString || typeof filamentString !== 'string') return null
    
    const parts = filamentString.trim().split(' ').filter(p => p.length > 0)
    if (parts.length >= 3) {
      return {
        brand: parts[0],
        type: parts[1],
        color: parts.slice(2).join(' ')
      }
    }
    return null
  },
  
  addFilamentIfNotExists(brand, type, color, hexColor = '#000000') {
    const id = `${brand}-${type}-${color}`
    if (!this.getFilamentById(id)) {
      this.filaments.push({ id, brand, type, color, hexColor })
    }
  }
})

// Load saved data on startup
const savedData = localStorage.getItem(STORAGE_KEY)
if (savedData) {
  const { filaments, flushData, nextSampleId } = JSON.parse(savedData)
  
  // Migrate filaments to add purchases array if missing
  const migratedFilaments = (filaments || []).map(filament => ({
    ...filament,
    purchases: filament.purchases || []
  }))
  
  store.filaments.push(...migratedFilaments)
  store.flushData.push(...(flushData || []))
  if (nextSampleId) store.nextSampleId = nextSampleId
  
  // Save migrated data back to localStorage
  if (filaments && filaments.some(f => !f.purchases)) {
    saveToStorage()
  }
}
