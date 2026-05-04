<template>
    <TopBar :title="pageTitle" />
    <Sidebar />
    <div class="main-content">
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
                            <router-link :to="`/patient-details/${patient.id}`" class="details-btn">
                                View Details
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';

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
.main-content {
    margin-left: 25vw;
    padding-top: 40px;
    padding: 80px 20px 20px 20px;
    background-color: var(--color-bg);
    min-height: calc(100vh - 60px);
    position: relative;
}

.patients-list {
    background-color: var(--color-primary);
    min-height: 20vh;
    width: calc(80vw/2);
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

.details-btn:hover {
    background-color: var(--color-primary-dark, #0056b3);
}
</style>