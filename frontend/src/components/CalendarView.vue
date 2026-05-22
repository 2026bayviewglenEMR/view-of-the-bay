<!-- // node node_modules/vite/bin/vite.js -->
<script setup>
import { ref, onMounted } from 'vue';
import { Qalendar } from 'qalendar';
import { http } from '../api/http';

const events = ref([]);
const config = ref({
  defaultMode: 'week',
});

const formatCalendarDate = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getPatientName = (patient) => {
  if (!patient) return 'Unknown patient';

  return [patient.firstName, patient.lastName].filter(Boolean).join(' ');
};

const mapAppointmentToEvent = (appointment) => ({
  id: appointment._id,
  title: appointment.reasonForVisit || 'Appointment',
  with: getPatientName(appointment.patientId),
  description: appointment.notes || '',
  time: {
    start: formatCalendarDate(appointment.scheduledStartTime),
    end: formatCalendarDate(appointment.scheduledEndTime),
  },
});

const loadAppointments = async () => {
  try {
    const response = await http.get('/calendar/my-calendar');
    events.value = (response.data.appointments || []).map(mapAppointmentToEvent);
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};

onMounted(loadAppointments);

const updateAppointment = async (updatedEvent) => {
  try {
    const response = await http.put(`/calendar/appointments/${updatedEvent.id}/reschedule`, {
      scheduledStartTime: new Date(updatedEvent.time.start).toISOString(),
      scheduledEndTime: new Date(updatedEvent.time.end).toISOString(),
    });

    const updatedAppointment = response.data;
    events.value = events.value.map((event) =>
      event.id === updatedAppointment._id ? mapAppointmentToEvent(updatedAppointment) : event
    );
  } catch (error) {
    console.error("Error updating appointment time:", error);
    await loadAppointments();
  }
};
</script>

<template>
  <div class="calendar-wrapper">
    <Qalendar 
      :events="events" 
      :config="config" 
      @event-was-updated="updateAppointment" 
    />
  </div>
</template>

<style scoped>
.calendar-wrapper {
  background-color: #f5f3e6;
  border: 2px solid #2e6d4f;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

:deep(.qalendar-is-light-mode) {
  --qalendar-theme-color: #2e6d4f; 
  --qalendar-paper: #f5f3e6; 
  --qalendar-border-color: rgba(46, 109, 79, 0.2); 
  --qalendar-heading-color: #2e6d4f;
  --qalendar-base-color: #333333;
}
</style>
