<script setup>
import { ref } from 'vue';

// 1. Modal & Loading States
const isOpen = ref(false);
const isSaving = ref(false);
const isSending = ref(false);

// 2. Document Controls
const showIcd10 = ref(true);
const documentType = ref('Prescription');
const documentContent = ref(''); // Starts completely empty!

// 3. Database Data Variables
const patientName = ref('Loading...');
const patientId = ref('123'); // Note: In a finished app, this would be a prop passed from the parent!
const date = new Date().toLocaleDateString();

// 4. GET ROUTE: Fetch patient data when the modal opens
const openModal = async () => {
  isOpen.value = true;
  
  try {
    const response = await fetch(`http://localhost:3000/api/patients/${patientId.value}`);
    if (!response.ok) throw new Error('Failed to fetch patient data');
    
    const data = await response.json();
    patientName.value = data.name; // Injects the real name from the DB
    
    // Give them a starting prompt if the box is empty
    if (!documentContent.value) {
      documentContent.value = "Begin typing document here...";
    }
  } catch (error) {
    console.error("Error:", error);
    patientName.value = "Unknown Patient";
  }
};

const closeModal = () => {
  isOpen.value = false;
};

// 5. POST ROUTE: Save to patient file
const saveDocument = async () => {
  isSaving.value = true; // Turn on button spinner
  
  try {
    const response = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patientId.value,
        type: documentType.value,
        includesIcd10: showIcd10.value,
        content: documentContent.value
      })
    });

    if (!response.ok) throw new Error('Failed to save document');
    
    alert(`Successfully saved ${documentType.value} to patient file!`);
    closeModal();
  } catch (error) {
    console.error("Error saving:", error);
    alert("Failed to save document. Is the server running?");
  } finally {
    isSaving.value = false; // Turn off button spinner
  }
};

// 6. POST ROUTE: Trigger backend email
const sendDocument = async () => {
  isSending.value = true; // Turn on button spinner
  
  try {
    const response = await fetch('http://localhost:3000/api/documents/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patientId.value,
        type: documentType.value,
        content: documentContent.value
      })
    });

    if (!response.ok) throw new Error('Failed to send email');
    
    alert(`Successfully emailed ${documentType.value} to patient!`);
    closeModal();
  } catch (error) {
    console.error("Error sending:", error);
    alert("Failed to send document.");
  } finally {
    isSending.value = false; // Turn off button spinner
  }
};

// 7. Local Print Function (No DB needed)
const printDocument = () => {
  window.print(); 
};
</script>

<template>
  <div>
    <button class="button is-primary" @click="openModal">
      📄 Create Document
    </button>

    <div class="modal" :class="{ 'is-active': isOpen }">
      <div class="modal-background" @click="closeModal"></div>
      
      <div class="modal-card" style="width: 800px; max-width: 95vw;">
        
        <header class="modal-card-head has-background-info-light">
          <p class="modal-card-title has-text-info-dark has-text-weight-bold">
            Document Generator
          </p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>

        <section class="modal-card-body" id="printable-area">
          
          <div class="field is-grouped is-grouped-multiline mb-5 pb-4 border-bottom hide-on-print">
            <div class="control">
              <div class="select is-small">
                <select v-model="documentType">
                  <option>Prescription</option>
                  <option>Sick Note</option>
                  <option>Referral</option>
                  <option>Summary</option>
                </select>
              </div>
            </div>
            <div class="control ml-auto">
              <label class="checkbox mt-1">
                <input type="checkbox" v-model="showIcd10">
                Include ICD-10 Diagnosis Code
              </label>
            </div>
          </div>

          <div class="document-paper p-5 has-background-white">
            
            <div class="columns is-mobile is-vcentered border-bottom pb-3 mb-4">
              <div class="column is-half">
                <h2 class="title is-4 has-text-link mb-1">⚕️ Dr. Richard Harris</h2>
                <p class="is-size-7 has-text-grey">General Practitioner<br>Practice number: 7488548</p>
              </div>
              <div class="column is-half has-text-right">
                <h3 class="subtitle is-6 mb-1 has-text-weight-bold">{{ documentType }}</h3>
                <p class="is-size-7">Patient: <strong>{{ patientName }}</strong><br>Date: {{ date }}</p>
              </div>
            </div>

            <div v-if="showIcd10" class="notification is-light is-warning py-2 px-3 mb-4 is-size-7">
              <strong>Diagnosis:</strong> J45.8 (Asthma)
            </div>

            <div class="field mb-5">
              <label class="label is-size-7 has-text-grey-light hide-on-print">Document Body</label>
              <div class="control">
                <textarea 
                  class="textarea document-textarea" 
                  v-model="documentContent" 
                  rows="8"
                ></textarea>
              </div>
            </div>

            <div class="mt-6 pt-4">
              <div class="signature-line">
                <span class="fake-signature">Dr. R. Harris</span>
              </div>
              <p class="is-size-7 has-text-grey mt-1">Electronically Signed</p>
            </div>

          </div>
        </section>

        <footer class="modal-card-foot is-justify-content-flex-end hide-on-print">
          <button class="button" @click="printDocument">🖨️ Print</button>
          
          <button 
            class="button is-info is-light" 
            :class="{ 'is-loading': isSending }" 
            @click="sendDocument"
          >
            ✉️ Send/Email
          </button>
          
          <button 
            class="button is-success" 
            :class="{ 'is-loading': isSaving }" 
            @click="saveDocument"
          >
            💾 Save to File
          </button>
        </footer>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #eeeeee;
}

.document-paper {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.document-textarea {
  border: none;
  box-shadow: none;
  background-color: #fafafa;
  resize: vertical;
  font-family: inherit;
}

.document-textarea:focus {
  background-color: #fff;
  border: 1px solid #b5b5b5;
}

.fake-signature {
  font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
  font-size: 2.5rem;
  color: #2c3e50;
  padding-right: 20px;
}

.signature-line {
  border-bottom: 1px solid #000;
  display: inline-block;
  min-width: 200px;
  line-height: 0.8;
}

/* This hides the buttons and dropdowns if the doctor actually hits "Print" */
@media print {
  .hide-on-print {
    display: none !important;
  }
  .document-paper {
    border: none;
    box-shadow: none;
  }
}
</style>