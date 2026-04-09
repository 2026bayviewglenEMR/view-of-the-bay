exports.searchPatients = async (req, res) => {
  try {
    const { name, dob, mrn, page = 1, limit = 20 } = req.query;
    // TODO: build query object from provided filters, paginate with mongoose
    res.json({ patients: [], total: 0, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPatientRecord = async (req, res) => {
  try {
    // TODO: validate body, create Patient document, return saved record
    res.status(201).json({ message: 'Patient created', patient: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    // TODO: Patient.findById(patientId).populate('medications allergies diagnoses')
    res.json({ patientId, record: {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePatientRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    // TODO: Patient.findByIdAndUpdate(patientId, req.body, { new: true })
    res.json({ message: 'Patient updated', patientId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePatientRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    // TODO: soft delete — Patient.findByIdAndUpdate(patientId, { active: false })
    res.json({ message: 'Patient deactivated', patientId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Visit History
exports.getPatientVisitHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10, from, to } = req.query;
    // TODO: Visit.find({ patientId }).sort({ visitDate: -1 }).skip().limit()
    res.json({ patientId, visits: [], total: 0, page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addVisit = async (req, res) => {
  try {
    const { patientId } = req.params;
    // TODO: new Visit({ patientId, ...req.body, createdBy: req.user._id }).save()
    res.status(201).json({ message: 'Visit added', patientId, visit: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVisit = async (req, res) => {
  try {
    const { patientId, visitId } = req.params;
    // TODO: Visit.findOneAndUpdate({ _id: visitId, patientId }, req.body, { new: true })
    res.json({ message: 'Visit updated', visitId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Medications
exports.getPatientMedications = async (req, res) => {
  try {
    const { patientId } = req.params;
    // TODO: Medication.find({ patientId, discontinued: false })
    res.json({ patientId, medications: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMedication = async (req, res) => {
  try {
    const { patientId } = req.params;
    res.status(201).json({ message: 'Medication added', patientId, medication: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMedication = async (req, res) => {
  try {
    const { patientId, medicationId } = req.params;
    res.json({ message: 'Medication updated', medicationId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.discontinueMedication = async (req, res) => {
  try {
    const { patientId, medicationId } = req.params;
    // TODO: Medication.findByIdAndUpdate(medicationId, { discontinued: true, discontinuedDate: Date.now() })
    res.json({ message: 'Medication discontinued', medicationId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Allergies
exports.getPatientAllergies = async (req, res) => {
  try {
    const { patientId } = req.params;
    res.json({ patientId, allergies: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addAllergy = async (req, res) => {
  try {
    const { patientId } = req.params;
    res.status(201).json({ message: 'Allergy added', patientId, allergy: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAllergy = async (req, res) => {
  try {
    const { allergyId } = req.params;
    res.json({ message: 'Allergy removed', allergyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Diagnoses
exports.getPatientDiagnoses = async (req, res) => {
  try {
    const { patientId } = req.params;
    res.json({ patientId, diagnoses: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addDiagnosis = async (req, res) => {
  try {
    const { patientId } = req.params;
    res.status(201).json({ message: 'Diagnosis added', patientId, diagnosis: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDiagnosis = async (req, res) => {
  try {
    const { diagnosisId } = req.params;
    res.json({ message: 'Diagnosis updated', diagnosisId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Documents
exports.getPatientDocuments = async (req, res) => {
  try {
    const { patientId } = req.params;
    res.json({ patientId, documents: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { patientId } = req.params;
    // req.file is populated by multer
    // TODO: save file metadata to DB, store file in S3 or local disk
    res.status(201).json({ message: 'Document uploaded', patientId, file: req.file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    // TODO: remove from DB and from file storage
    res.json({ message: 'Document deleted', documentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};