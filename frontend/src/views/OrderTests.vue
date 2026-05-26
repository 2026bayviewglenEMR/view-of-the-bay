<template>
  <MainLayout>
    <template #default="{ sidebarOpen }">
      <div class="order-tests-outer" :class="{ 'sidebar-open': sidebarOpen }">

        <PatientSidebar v-if="patient" :patient="patient" />

        <div class="order-tests-page">

          <!-- ── STEP 1: Select tests ── -->
          <template v-if="step === 'select'">
            <div class="page-header">
              <button class="back-link" @click="goBack">← Back to Consultation</button>
              <h1 class="page-title">🧪 Order Additional Tests</h1>
              <p class="page-subtitle">Select the tests to include on the order form.</p>
            </div>

            <div v-for="category in categories" :key="category" class="category-block">
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

            <div class="page-actions">
              <button class="cancel-btn" @click="goBack">Cancel</button>
              <button
                class="done-btn"
                :disabled="selected.length === 0"
                :class="{ disabled: selected.length === 0 }"
                @click="step = 'confirm'"
              >
                Done
              </button>
            </div>
          </template>

          <!-- ── STEP 2: Confirm + generate ── -->
          <template v-else>
            <div class="page-header">
              <button class="back-link" @click="step = 'select'">← Back to Test Selection</button>
              <h1 class="page-title">✅ Ready to Order</h1>
              <p class="page-subtitle">
                {{ selected.length }} test{{ selected.length !== 1 ? 's' : '' }} will be ordered for
                <strong>{{ patientName || 'this patient' }}</strong>.
              </p>
            </div>

            <ul class="confirm-list">
              <li v-for="id in selected" :key="id" class="confirm-item">
                <span class="confirm-check">✓</span>
                {{ testById(id)?.name }}
              </li>
            </ul>

            <p class="confirm-note">
              Clicking <strong>Generate PDF</strong> will download the order form and save these tests to the patient's record.
            </p>

            <div class="page-actions">
              <button class="cancel-btn" @click="step = 'select'">Back</button>
              <button class="generate-btn" @click="generatePDF">
                📄 Generate PDF
              </button>
            </div>
          </template>

        </div>
      </div>
    </template>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jsPDF } from 'jspdf'
import { LAB_TESTS, TEST_CATEGORIES } from './consultation/config/labTests.js'
import { api } from '../api/api.js'

import MainLayout from '@/components/MainLayout.vue'
import PatientSidebar from './consultation/PatientSidebar.vue'

const route = useRoute()
const router = useRouter()
const patientId = route.params.patientId

const patient = ref(null)
const step = ref('select')   // 'select' | 'confirm'
const categories = TEST_CATEGORIES
const selected = ref([])

// Authentication & Profile Parsing
const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
const doctorName = storedUser.firstName && storedUser.lastName
  ? `Dr. ${storedUser.firstName} ${storedUser.lastName}`
  : storedUser.username || ''

const patientName = computed(() =>
  patient.value ? `${patient.value.firstName} ${patient.value.lastName}` : ''
)
const patientDob = computed(() => patient.value?.dateOfBirth || '')

const alreadyOrderedIds = computed(() =>
  (patient.value?.orderedTests || []).filter(t => t.status === 'pending').map(t => t.testId)
)

function goBack() {
  router.push(`/diagnose/${patientId}`)
}

function testsByCategory(cat) {
  return LAB_TESTS.filter(t => t.category === cat)
}

function testById(id) {
  return LAB_TESTS.find(t => t.id === id)
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
  const selectedTests = LAB_TESTS.filter(t => selected.value.includes(t.id))

  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const W = 215.9
  const margin = 18
  let y = 20

  const green     = [46,  125, 50]
  const darkGreen = [16,  35,  11]
  const lightGray = [245, 245, 245]
  const midGray   = [180, 180, 180]
  const textDark  = [30,  30,  30]

  // Header bar
  doc.setFillColor(...green)
  doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('VIEW OF THE BAY CLINIC', margin, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Laboratory & Imaging Order Form', margin, 20)
  const todayStr = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(`Date Issued: ${todayStr}`, W - margin, 20, { align: 'right' })
  y = 36

  // Patient / Doctor info box
  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, y, W - margin * 2, 22, 3, 3, 'F')
  doc.setTextColor(...textDark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('PATIENT', margin + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(patientName.value || '______________________________', margin + 4, y + 14)
  if (patientDob.value) {
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`DOB: ${new Date(patientDob.value).toLocaleDateString()}`, margin + 4, y + 20)
  }
  const midX = W / 2 + 4
  doc.setTextColor(...textDark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('ORDERING PHYSICIAN', midX, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(doctorName || '______________________________', midX, y + 14)
  y += 30

  // Divider
  doc.setDrawColor(...midGray)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 6

  // Tests by category
  const byCategory = {}
  selectedTests.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = []
    byCategory[t.category].push(t)
  })

  const ROW_H  = 10
  const CAT_H  = 14
  const PAGE_H = 270

  Object.entries(byCategory).forEach(([cat, tests]) => {
    if (y + CAT_H + ROW_H > PAGE_H) { doc.addPage(); y = 20 }
    doc.setFillColor(...darkGreen)
    doc.rect(margin, y, W - margin * 2, 9, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(cat.toUpperCase(), margin + 4, y + 6.2)
    y += 11

    tests.forEach((test, i) => {
      if (y + ROW_H > PAGE_H) { doc.addPage(); y = 20 }
      if (i % 2 === 0) {
        doc.setFillColor(250, 252, 250)
        doc.rect(margin, y - 1, W - margin * 2, ROW_H, 'F')
      }
      doc.setDrawColor(...green)
      doc.setLineWidth(0.5)
      doc.rect(margin + 2, y + 1, 5, 5)
      doc.setFillColor(...green)
      doc.rect(margin + 3, y + 2, 3, 3, 'F')
      doc.setTextColor(...textDark)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(test.name, margin + 11, y + 5.5)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(110, 110, 110)
      doc.text(test.description, W - margin - 2, y + 5.5, { align: 'right', maxWidth: 90 })
      y += ROW_H
    })
    y += 4
  })

  // Signature section
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

  // Save to patient record
  if (patientId) {
    const testsToSave = selectedTests.map(t => ({ testId: t.id, testName: t.name }))
    api.saveOrderedTests(patientId, testsToSave).catch(err => {
      console.error('Failed to save ordered tests to patient record:', err)
    })
  }

  // Download
  const safeName = (patientName.value || 'patient').replace(/\s+/g, '_')
  doc.save(`test_order_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`)

  goBack()
}

onMounted(async () => {
  if (!patientId) return
  try {
    patient.value = await api.getPatient(patientId)
  } catch (err) {
    console.error('Failed to load patient', err)
  }
})
</script>

<style scoped>
.order-tests-outer {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
  transition: all 0.3s ease;
}

.order-tests-outer.sidebar-open :deep(.patient-panel) {
  width: 0;
  padding: 0;
  border: none;
  box-shadow: none;
  opacity: 0;
}

.order-tests-page {
  flex: 1;
  min-width: 0;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  padding: 36px 40px;
  background: #e8e4cf;
  border-radius: 12px;
}

.page-header {
  margin-bottom: 28px;
}

.back-link {
  background: none;
  border: none;
  color: #2d6a4f;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;
}

.back-link:hover {
  color: #1b5e20;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #10231b;
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #555;
  margin: 0;
}

/* ── Category blocks ── */
.category-block {
  margin-bottom: 18px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #10231b;
  color: white;
  padding: 8px 14px;
  border-radius: 8px 8px 0 0;
}

.category-title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.select-all-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.select-all-btn:hover { background: rgba(255,255,255,0.12); }

.test-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  transition: background 0.1s;
}
.test-row:last-child { border-bottom: none; border-radius: 0 0 8px 8px; }
.test-row:hover { background: #f5f9f5; }
.test-row.selected { background: #eef6ee; }
.test-row.already-ordered { background: #fff8e1; }
.test-row.already-ordered:hover { background: #fff3cd; }

.already-badge {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  padding: 2px 8px;
  white-space: nowrap;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  transition: all 0.15s;
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
  font-size: 0.92rem;
  font-weight: 600;
  color: #111;
}
.test-desc {
  font-size: 0.78rem;
  color: #888;
}

.selected-count {
  font-size: 0.88rem;
  color: #2e7d32;
  font-weight: 600;
  margin: 14px 0 8px;
  text-align: right;
}

/* ── Confirm step ── */
.confirm-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  border: 1px solid #e8f5e9;
  border-radius: 10px;
  overflow: hidden;
}

.confirm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  font-size: 0.92rem;
  font-weight: 500;
  color: #111;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}
.confirm-item:last-child { border-bottom: none; }
.confirm-item:nth-child(even) { background: #f9fdf9; }

.confirm-check {
  color: #2e7d32;
  font-weight: 700;
  font-size: 0.88rem;
  flex-shrink: 0;
}

.confirm-note {
  font-size: 0.85rem;
  color: #777;
  margin: 0 0 18px;
  line-height: 1.55;
}

/* ── Action buttons ── */
.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.cancel-btn {
  padding: 12px 22px;
  border: 2px solid #d6d0b6;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.15s;
}
.cancel-btn:hover {
  background: #f5f5f0;
}

.done-btn,
.generate-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  background: #2e7d32;
  color: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.15s;
}
.done-btn:hover,
.generate-btn:hover {
  background: #1b5e20;
  transform: translateY(-1px);
}
.done-btn.disabled {
  background: #bdbdbd;
  cursor: not-allowed;
  transform: none;
}
</style>
