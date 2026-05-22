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

router.get("/", getWaitingRoom);

router.post("/", checkInPatient);

router.patch("/:id/status", updatePatientStatus);

router.delete("/:id", removePatient);

router.get("/doctors/overview", getDoctorsOverview);

router.get("/patients/:id", getPatientDetails);

module.exports = router;