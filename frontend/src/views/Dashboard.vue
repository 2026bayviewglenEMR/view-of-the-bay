<template>
    <MainLayout >
        <div class="dashboard-grid">
            <div class="calendar-section">
                <CalendarView />
            </div>
            <div class="patients-list">
                <div class="patients-header">
                    <h2>Patients</h2>
                </div>
                <div class="patients-table">
                    <div class="table-header">
                        <div class="col-name">Patient Name</div>
                        <div class="col-time">Appointment Time</div>
                        <div class="col-status">Status</div>
                        <div class="col-actions">Details</div>
                    </div>
                    <div class="table-body">
                        <div v-for="patient in patients" :key="patient.id" class="table-row">
                            <div class="col-name">{{ patient.name }}</div>
                            <div class="col-time">{{ patient.appointmentTime }}</div>
                            <div class="col-status">
                                <span :class="['status-badge', patient.status.toLowerCase()]">
                                    {{ patient.status }}
                                </span>
                            </div>
                            <div class="col-actions">
                                <router-link :to="`/patient-details/${patient.id}`" class="icon-btn" title="View Details">
                                    <View />
                                </router-link>
                                <button
                                    class="icon-btn"
                                    @click="openTemplate(patient.id)"
                                    title="Diagnose Patient"
                                >
                                    <Edit />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>


<script setup>
import { ref } from 'vue';
import { View, Edit } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import MainLayout from '../components/MainLayout.vue';
import CalendarView from '../components/CalendarView.vue';

const router = useRouter();
const pageTitle = ref('Dashboard');

const patients = ref([
    {
        id: 1,
        name: 'John Doe',
        appointmentTime: '2:00 PM',
        status: 'Scheduled'
    },
    {
        id: 2,
        name: 'Jane Smith',
        appointmentTime: '2:30 PM',
        status: 'In Progress'
    },
    {
        id: 3,
        name: 'Michael Johnson',
        appointmentTime: '3:00 PM',
        status: 'Waiting'
    },
    {
        id: 4,
        name: 'Sarah Williams',
        appointmentTime: '3:30 PM',
        status: 'Completed'
    }
]);

const openTemplate = (id) => {
    router.push(`/diagnose/${id}`);
};
</script>


<style scoped>
.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
}

.calendar-section {
    background-color: var(--color-primary);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: fit-content;
}

.patients-list {
    background-color: var(--color-primary);
    min-height: 20vh;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.patients-header {
    margin-bottom: 20px;
    color: var(--color-text-1-dark);
}

.patients-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.patients-table {
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 6px;
    overflow: hidden;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1.2fr;
    gap: 16px;
    padding: 16px;
    background-color: #f5f5f5;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #ddd;
}

.table-body {
    display: flex;
    flex-direction: column;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1.2fr;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid #eee;
    align-items: center;
}

.table-row:hover {
    background-color: #f9f9f9;
}

.table-row:last-child {
    border-bottom: none;
}

.col-name, .col-time, .col-status, .col-actions {
    word-break: break-word;
}

.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    text-align: center;
}

.status-badge.scheduled {
    background-color: #e3f2fd;
    color: #1976d2;
}

.status-badge.in\ progress {
    background-color: #fff3e0;
    color: #f57c00;
}

.status-badge.waiting {
    background-color: #fce4ec;
    color: #c2185b;
}

.status-badge.completed {
    background-color: #e8f5e9;
    color: #388e3c;
}

.details-btn {
    display: inline-block;
    padding: 8px 16px;
    background-color: var(--color-primary);
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s;
    text-align: center;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
    margin: 0 4px;
    flex-shrink: 0;
}

.icon-btn:hover {
    background-color: var(--color-primary-dark, #0056b3);
    transform: scale(1.1);
}

.icon-btn svg {
    width: 18px;
    height: 18px;
}

.details-btn:hover {
    background-color: var(--color-primary-dark, #0056b3);
}
</style>