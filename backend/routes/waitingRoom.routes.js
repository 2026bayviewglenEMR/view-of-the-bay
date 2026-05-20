const express = require("express");
const router = express.Router();

const {
  getWaitingRoom,
  getDoctorsOverview,
  checkInPatient,
  updatePatientStatus,
  removePatient,
  getPatientDetails,
} = require("../controllers/waitingRoom.controller");

router.get("/waiting-room",              getWaitingRoom);
router.post("/waiting-room",             checkInPatient);
router.patch("/waiting-room/:id/status", updatePatientStatus);
router.delete("/waiting-room/:id",       removePatient);

router.get("/doctors/overview",          getDoctorsOverview);

router.get("/patients/:id",              getPatientDetails);

module.exports = router;