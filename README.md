# ClinicOS — Electronic Medical Records & Practice Management System

## Description

ClinicOS is a comprehensive, role-based clinic management platform designed to streamline the day-to-day operations of a modern medical practice. It serves as a unified workspace for both clinical and administrative staff, bringing together patient records, consultations, scheduling, communications, and document management into a single, cohesive system.

At its core, ClinicOS is built around two distinct user experiences: one for **doctors**, who need fast, clinical-focused tools to manage their patients and consultations; and one for **administrators**, who need a high-level operational view of the clinic without access to sensitive clinical data. Every page and feature in the system adapts in real time based on the logged-in user's role, ensuring that each person sees exactly what they need — and nothing they shouldn't.

The platform emphasizes speed, clarity, and legal compliance. Doctors can move fluidly through a structured consultation workflow, reuse saved templates, generate prescriptions and referral letters, and maintain a living record of each patient's history. Administrators can manage bookings, monitor clinic flow, update patient demographics, and handle scheduling — all without ever touching clinical data they are not authorized to view.

---

## Modules & Functionality

### 1. Login & Security
- Standard login form (username and password)
- On authentication, the backend returns a user profile containing a **role** (`doctor` or `admin`)
- The role is stored and passed throughout the app to control what each user can see and do

---

### 2. Dashboard & Waiting Room

**Doctors see:**
- "My Schedule" — a focused list of their appointments for today
- "My Queue" — patients currently checked in and waiting for them
- A "Start Consultation" button linking to the Consultation Engine

**Administrators see:**
- "Global Waiting Room" — all patients currently in the building
- "Clinic Overview" — a high-level view of all doctors and their current availability (busy/free)
- Navigation tabs linking to scheduling and patient management pages

---

### 3. Patient Record & Executive Summary

**Shown to everyone:**
- Executive Summary panel (always visible): patient name, photo, allergies, and active medications
- Central timeline of all past visits

**Doctors additionally see:**
- Action buttons: "Add Diagnosis", "Update Medications", "Edit Clinical History"
- "Start Consultation" button linking to the Consultation Engine

**Administrators see:**
- Clinical history and medications in **read-only** mode
- Action button: "Edit Demographics" (for updating phone numbers, addresses, and insurance information)

---

### 4. Consultation Engine

**Doctors see:**
A full 4-tab consultation wizard:
1. **Symptoms** — free-text entry, guided yes/no questions, prebuilt templates (e.g. flu, COVID), auto-builds a consultation summary
2. **Vitals / Examination** — blood pressure, temperature, nurse pre-filled data, conditional and specialty-specific forms
3. **Diagnose & Prescribe** — ICD diagnosis codes, medication prescribing with drug interaction checks, favorites, patient medication history, digital prescription generation
4. **Plan** — clinical notes, outcomes (referral, follow-up, tests), sick note generation, referral letter auto-generation

Action button: "Save & Complete Visit" — submits the full consultation payload to the backend. Integrates with the Templates & Auto-Gen Docs module.

**Administrators see:**
- **Access Denied** — admins are legally prohibited from performing clinical consultations. They are shown a lock screen or are entirely prevented from routing to this page.

---

### 5. Templates & Auto-Generated Documents

**Doctors see:**
- "My Templates" — tools to create, edit, and save personal text templates for diagnoses and prescriptions
- "Update Templates" — modify existing templates

**Administrators see:**
- "Clinic Templates" — a **read-only** view of standard clinic forms

---

### 6. Communication Tools & Document Management

**Shown to everyone:**
- In-app messaging between all users (doctors, admins, staff)
- Ability to upload and send documents within conversations
- Support for PDFs, images, and scanned files
- Documents are tagged (e.g., radiology, reports) and accessible via the patient timeline

---

### 7. Scheduling, Tabs & Alerts

**Doctors see:**
- "My Calendar" — their personal schedule only
- "My Queue" — list of upcoming appointments
- "My Tasks" — clinical alerts specific to their patients (e.g., "Patient X needs a stress screening")
- Auto-generate buttons: "Sick Notes" and "Prescriptions" as printable PDFs

**Administrators see:**
- "Master Calendar" — a full view of all doctors' schedules
- Action buttons: "Book New Appointment", "Reschedule/Cancel"
- Auto-generate buttons: administrative documents such as "Referral Letters" and "Billing Summaries"

**Patient Tabs (shown to everyone):**
- A tab bar displaying each open patient file
- A "+" button to open a new patient tab
- Enables quick switching between multiple patients without losing context

---

## Role Summary

| Feature | Doctor | Administrator |
|---|---|---|
| View own schedule | ✅ | ❌ |
| View all doctors' schedules | ❌ | ✅ |
| Start consultation | ✅ | 🔒 Access Denied |
| Edit clinical history | ✅ | ❌ Read-only |
| Edit patient demographics | ❌ | ✅ |
| Manage personal templates | ✅ | ❌ Read-only |
| Book / reschedule appointments | ❌ | ✅ |
| Messaging & document sharing | ✅ | ✅ |
| Global waiting room view | ❌ | ✅ |
| Generate sick notes / prescriptions | ✅ | ❌ |
| Generate referral letters / billing | ❌ | ✅ |
