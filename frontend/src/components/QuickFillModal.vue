<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <div>
          <h2>⚡ Quick Fill</h2>
          <p class="subtitle">Select a condition to auto-fill the consultation forms.</p>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Tag filter -->
      <div class="tag-filters">
        <button
          v-for="tag in ['All', ...TEMPLATE_TAGS]"
          :key="tag"
          class="tag-btn"
          :class="{ active: activeTag === tag }"
          @click="activeTag = tag"
        >
          {{ tag }}
        </button>
      </div>

      <!-- Condition grid -->
      <div class="condition-grid">
        <button
          v-for="tmpl in filtered"
          :key="tmpl.id"
          class="condition-card"
          @click="apply(tmpl)"
        >
          <span class="condition-icon">{{ tmpl.icon }}</span>
          <span class="condition-name">{{ tmpl.name }}</span>
          <span class="condition-tag">{{ tmpl.tag }}</span>
          <span class="condition-med">
            💊 {{ tmpl.fills.prescribe_medication.medications[0]?.name }}
            {{ tmpl.fills.prescribe_medication.dosage }}
          </span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PRESCRIPTION_TEMPLATES, TEMPLATE_TAGS } from '../config/prescriptionTemplates.js'

const emit = defineEmits(['apply', 'close'])

const activeTag = ref('All')

const filtered = computed(() =>
  activeTag.value === 'All'
    ? PRESCRIPTION_TEMPLATES
    : PRESCRIPTION_TEMPLATES.filter(t => t.tag === activeTag.value)
)

function apply(tmpl) {
  emit('apply', tmpl)
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 680px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0,0,0,0.22);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0 0 4px;
  font-size: 1.25rem;
  color: #10231b;
}

.subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
.close-btn:hover { background: #f0f0f0; }

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.tag-btn {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid #d1d5db;
  background: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #555;
  transition: all 0.15s;
}
.tag-btn:hover { border-color: #2d6a4f; color: #2d6a4f; }
.tag-btn.active {
  background: #2d6a4f;
  border-color: #2d6a4f;
  color: white;
}

.condition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
}

.condition-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.condition-card:hover {
  border-color: #2d6a4f;
  background: #f0faf3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45,106,79,0.12);
}

.condition-icon {
  font-size: 1.6rem;
  margin-bottom: 2px;
}

.condition-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #10231b;
}

.condition-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 4px;
  padding: 1px 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.condition-med {
  font-size: 0.75rem;
  color: #4a7c60;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
