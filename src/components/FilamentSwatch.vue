<template>
  <div style="display: flex; align-items: center; gap: 8px;" v-if="filament">
    <div 
      :style="{ 
        backgroundColor: filament.hexColor, 
        width: size + 'px', 
        height: size + 'px', 
        borderRadius: '4px', 
        border: '1px solid #ccc',
        flexShrink: 0
      }"
    ></div>
    <div v-if="singleLine">
      <div style="line-height: 1.2;">
        <span style="font-weight: bold; "> {{ filament.brand }} {{ filament.type }}</span> - {{ filament.color }}
      </div>
    </div>
    <div v-else>
      <div style="font-weight: bold; line-height: 1.2;">
        {{ filament.brand }} {{ filament.type }}
      </div>
      <div style="line-height: 1.2;">
        {{ filament.color }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  filament: {
    type: Object,
    required: true
  },
  size: {
    type: Number,
    default: 20
  },
  singleLine: {
    type: Boolean,
    default: false
  }
})
</script>
