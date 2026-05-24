<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">

      <div class="modal-header">
        <h2>🧪 Order Additional Tests</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <p class="subtitle">Select the tests to include on the printed order form.</p>

      <!-- Category sections -->
      <div
        v-for="category in categories"
        :key="category"
        class="category-block"
      >
        <div class="category-header">
          <span class="category-title">{{ category }}</span>
          <button class="select-all-btn" @click="toggleCategory(category)">
            {{ allSelectedInCategory(category) ? 'Deselect all' : 'Select all' }}
          </button>
        </div>

        <div
          v-for="test in testsByCategory(category)"
          :key="test.id"
          class="test-row"
          :class="{ selected: selected.includes(test.id), 'already-ordered': alreadyOrderedIds.includes(test.id) }"
          @click="toggle(test.id)"
        >
          <div class="checkbox" :class="{ checked: selected.includes(test.id) }">
            <span v-if="selected.includes(test.id)">✓</span>
          </div>
          <div class="test-info">
            <span class="test-name">{{ test.name }}</span>
            <span class="test-desc">{{ test.description }}</span>
          </div>
          <span v-if="alreadyOrderedIds.includes(test.id)" class="already-badge">⚠ Already ordered</span>
        </div>
      </div>

      <div class="selected-count">
        {{ selected.length }} test{{ selected.length !== 1 ? 's' : '' }} selected
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">Cancel</button>
        <button
          class="generate-btn"
          :disabled="selected.length === 0"
          :class="{ disabled: selected.length === 0 }"
          @click="generatePDF"
        >
          📄 Generate PDF
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { jsPDF } from 'jspdf'
import { LAB_TESTS, TEST_CATEGORIES } from '../config/labTests.js'
import { api } from '../api/api.js'

const props = defineProps({
  patientId:        { type: String, default: '' },
  patientName:      { type: String, default: '' },
  patientDob:       { type: String, default: '' },
  doctorName:       { type: String, default: '' },
  alreadyOrderedIds:{ type: Array,  default: () => [] },  // testIds already pending
})

defineEmits(['close'])

const categories = TEST_CATEGORIES
const selected = ref([])

function testsByCategory(cat) {
  return LAB_TESTS.filter(t => t.category === cat)
}

function toggle(id) {
  const idx = selected.value.indexOf(id)
  if (idx === -1) selected.value.push(id)
  else selected.value.splice(idx, 1)
}

function allSelectedInCategory(cat) {
  const ids = testsByCategory(cat).map(t => t.id)
  return ids.every(id => selected.value.includes(id))
}

function toggleCategory(cat) {
  const ids = testsByCategory(cat).map(t => t.id)
  if (allSelectedInCategory(cat)) {
    selected.value = selected.value.filter(id => !ids.includes(id))
  } else {
    ids.forEach(id => { if (!selected.value.includes(id)) selected.value.push(id) })
  }
}

function generatePDF() {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const W = 215.9  // letter width mm
  const margin = 18
  let y = 20

  // ── Colour palette ──────────────────────────────────────────────────────────
  const green     = [46,  125, 50]
  const darkGreen = [16,  35,  11]
  const lightGray = [245, 245, 245]
  const midGray   = [180, 180, 180]
  const textDark  = [30,  30,  30]

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(...green)
  doc.rect(0, 0, W, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('VIEW OF THE BAY CLINIC', margin, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Laboratory & Imaging Order Form', margin, 20)

  const todayStr = new Date().toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  doc.text(`Date Issued: ${todayStr}`, W - margin, 20, { align: 'right' })

  y = 36

  // ── Patient / Doctor info box ────────────────────────────────────────────────
  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, y, W - margin * 2, 22, 3, 3, 'F')

  doc.setTextColor(...textDark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PATIENT', margin + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(props.patientName || '______________________________', margin + 4, y + 14)

  if (props.patientDob) {
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`DOB: ${new Date(props.patientDob).toLocaleDateString()}`, margin + 4, y + 20)
  }

  const midX = W / 2 + 4
  doc.setTextColor(...textDark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('ORDERING PHYSICIAN', midX, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(props.doctorName || '______________________________', midX, y + 14)

  y += 30

  // ── Divider ─────────────────────────────────────────────────────────────────
  doc.setDrawColor(...midGray)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 6

  // ── Tests by category ────────────────────────────────────────────────────────
  const selectedTests = LAB_TESTS.filter(t => selected.value.includes(t.id))
  const byCategory = {}
  selectedTests.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = []
    byCategory[t.category].push(t)
  })

  const ROW_H   = 10
  const CAT_H   = 14
  const PAGE_H  = 270

  Object.entries(byCategory).forEach(([cat, tests]) => {
    // Page break check for category header
    if (y + CAT_H + ROW_H > PAGE_H) { doc.addPage(); y = 20 }

    // Category header
    doc.setFillColor(...darkGreen)
    doc.rect(margin, y, W - margin * 2, 9, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(cat.toUpperCase(), margin + 4, y + 6.2)
    y += 11

    tests.forEach((test, i) => {
      if (y + ROW_H > PAGE_H) { doc.addPage(); y = 20 }

      // Alternating row background
      if (i % 2 === 0) {
        doc.setFillColor(250, 252, 250)
        doc.rect(margin, y - 1, W - margin * 2, ROW_H, 'F')
      }

      // Checkbox
      doc.setDrawColor(...green)
      doc.setLineWidth(0.5)
      doc.rect(margin + 2, y + 1, 5, 5)
      doc.setFillColor(...green)
      doc.rect(margin + 3, y + 2, 3, 3, 'F')   // filled = checked

      // Test name
      doc.setTextColor(...textDark)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(test.name, margin + 11, y + 5.5)

      // Description (right-aligned, lighter)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(110, 110, 110)
      doc.text(test.description, W - margin - 2, y + 5.5, { align: 'right', maxWidth: 90 })

      y += ROW_H
    })

    y += 4  // gap between categories
  })

  // ── Signature section ────────────────────────────────────────────────────────
  y += 6
  if (y + 30 > PAGE_H) { doc.addPage(); y = 20 }

  doc.setDrawColor(...midGray)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...textDark)
  doc.text('Physician Signature:', margin, y)
  doc.setDrawColor(...midGray)
  doc.line(margin + 42, y + 1, margin + 110, y + 1)

  doc.text('Date:', W - margin - 60, y)
  doc.line(W - margin - 48, y + 1, W - margin, y + 1)

  y += 14
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(150, 150, 150)
  doc.text(
    'This order form is generated by ClinicOS · View of the Bay Clinic · For authorized medical use only',
    W / 2, y, { align: 'center' }
  )

  // ── Save to patient record ───────────────────────────────────────────────────
  if (props.patientId) {
    const testsToSave = selectedTests.map(t => ({ testId: t.id, testName: t.name }))
    api.saveOrderedTests(props.patientId, testsToSave).catch(err => {
      console.error('Failed to save ordered tests to patient record:', err)
    })
  }

  // ── Download PDF ─────────────────────────────────────────────────────────────
  const safeName = (props.patientName || 'patient').replace(/\s+/g, '_')
  doc.save(`test_order_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 28px;
  width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.modal-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #10231b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888;
  padding: 4px 8px;
  border-radius: 4px;
}

.close-btn:hover { background: #f0f0f0; }

.subtitle {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 18px;
}

.category-block {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #10231b;
  color: white;
  padding: 6px 10px;
  border-radius: 6px 6px 0 0;
}

.category-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.select-all-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.select-all-btn:hover { background: rgba(255,255,255,0.1); }

.test-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.1s;
}

.test-row:last-child { border-bottom: none; }
.test-row:hover { background: #f5f9f5; }
.test-row.selected { background: #eef6ee; }
.test-row.already-ordered { background: #fff8e1; }
.test-row.already-ordered:hover { background: #fff3cd; }

.already-badge {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  transition: all 0.1s;
}

.checkbox.checked {
  background: #2e7d32;
  border-color: #2e7d32;
}

.test-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.test-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #111;
}

.test-desc {
  font-size: 0.75rem;
  color: #888;
}

.selected-count {
  font-size: 0.82rem;
  color: #2e7d32;
  font-weight: 600;
  margin: 12px 0 6px;
  text-align: right;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.cancel-btn {
  padding: 9px 18px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
}

.generate-btn {
  padding: 9px 20px;
  border: none;
  border-radius: 8px;
  background: #2e7d32;
  color: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
}

.generate-btn:hover { background: #1b5e20; }

.generate-btn.disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
</style>
