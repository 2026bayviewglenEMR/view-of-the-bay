<template>
  <MainLayout title="Profile">
    <div class="profile-container">
      <div class="main-content">
        <h2>User Profile</h2>

        <p v-if="loading">Loading profile...</p>

        <div v-if="user" class="profile-card profile-header-card">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" alt="Profile picture" />
              <div v-else class="avatar-placeholder">{{ initials }}</div>
              <label class="avatar-upload-btn" :class="{ uploading: uploadingAvatar }">
                {{ uploadingAvatar ? '...' : '📷' }}
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleAvatarUpload" :disabled="uploadingAvatar" hidden />
              </label>
            </div>
            <div class="avatar-hint">Click the camera icon to change your photo</div>
          </div>

          <div class="profile-info">
            <h3>{{ fullName }}</h3>
            <p><strong>Username:</strong> {{ user.username }}</p>
            <p><strong>Email:</strong> {{ user.email || "Not provided" }}</p>
            <p><strong>Role:</strong> {{ user.role }}</p>
            <p><strong>Account Status:</strong> {{ user.isActive ? "Active" : "Inactive" }}</p>
          </div>
        </div>

        <div v-else class="profile-card">
          <p>No logged-in user found.</p>
        </div>

        <div v-if="user?.role === 'patient'" class="profile-card">
          <h3>Patient Information</h3>

          <p><strong>Phone:</strong> {{ patientData?.demographics?.phone || "Not provided" }}</p>

          <p><strong>Address:</strong> {{ patientData?.demographics?.address || "Not provided" }}</p>

          <p><strong>Date of Birth:</strong> {{ formatDate(patientData?.dateOfBirth) }}</p>

          <p>
            <strong>Allergies:</strong>
            {{ formatList(patientData?.executiveSummary?.allergies) }}
          </p>

          <p>
            <strong>Active Medications:</strong>
            {{ formatMedications(patientData?.executiveSummary?.activeMedications) }}
          </p>
        </div>

        <div v-if="user?.role === 'doctor'" class="profile-card">
          <h3>Doctor Dashboard</h3>

          <p><strong>Total Appointments:</strong> {{ doctorStats.totalAppointments }}</p>

          <p><strong>Today's Appointments:</strong> {{ doctorStats.todaysAppointments }}</p>

          <p><strong>Pending Tasks:</strong> {{ doctorStats.pendingTasks }}</p>

          <p><strong>Active Alerts:</strong> {{ doctorStats.activeAlerts }}</p>
        </div>

        <div v-if="user?.role === 'admin'" class="profile-card">
          <h3>Admin Dashboard</h3>

          <p><strong>Total Users:</strong> {{ adminStats.totalUsers }}</p>

          <p><strong>Total Patients:</strong> {{ adminStats.totalPatients }}</p>

          <p><strong>Total Doctors:</strong> {{ adminStats.totalDoctors }}</p>

          <p><strong>Total Admins:</strong> {{ adminStats.totalAdmins }}</p>

          <p><strong>Total Appointments:</strong> {{ adminStats.totalAppointments }}</p>
        </div>

        <div v-if="user" class="profile-card actions-card">
          <h3>Account Actions</h3>

          <div class="button-row">
            <button
              class="action-button"
              @click="updatePassword"
            >
              Update Password
            </button>

            <button
              class="logout-button"
              @click="logout"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "../components/MainLayout.vue";
import { api } from "../api/api";
import { currentUser, updateUser, getAvatarUrl } from "../composables/useUser.js";

const router = useRouter();

const user = currentUser;
const uploadingAvatar = ref(false);

const avatarUrl = computed(() => getAvatarUrl(user.value?.profilePicture));

const initials = computed(() => {
  if (!user.value) return '?';
  const f = user.value.firstName?.[0] || '';
  const l = user.value.lastName?.[0] || '';
  return (f + l).toUpperCase() || user.value.username?.[0]?.toUpperCase() || '?';
});

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  uploadingAvatar.value = true;
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const { profilePicture } = await api.uploadAvatar(formData);
    updateUser({ profilePicture });
  } catch (err) {
    alert('Failed to upload photo. Please try again.');
  } finally {
    uploadingAvatar.value = false;
    event.target.value = '';
  }
}

const patientData =
  ref(null);

const loading =
  ref(true);

const doctorStats =
  ref({
    totalAppointments: 0,
    todaysAppointments: 0,
    pendingTasks: 0,
    activeAlerts: 0
  });

const adminStats =
  ref({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
    totalAppointments: 0
  });

const fullName =
  computed(() => {

    if (!user.value)
      return "Unknown User";

    return (
      `${user.value.firstName || ""}
      ${user.value.lastName || ""}`
    ).trim() ||
      user.value.username;

  });

const formatDate =
  (date) => {

    if (!date)
      return "Not provided";

    return new Date(
      date
    ).toLocaleDateString();

  };

const formatList =
  (items) => {

    if (
      !items ||
      items.length === 0
    )
      return "None listed";

    return items.join(", ");

  };

const formatMedications =
  (meds) => {

    if (
      !meds ||
      meds.length === 0
    )
      return "None listed";

    return meds
      .map(
        med =>
          `${med.name || med.medicationName || ""}
          ${med.dosage || ""}
          ${med.frequency || ""}`
      )
      .join(", ");

  };

const updatePassword =
async () => {

  const newPassword =
    prompt(
      "Enter new password"
    );

  if (!newPassword)
    return;

  try {

    await api
      .updatePassword(
        newPassword
      );

    alert(
      "Password updated."
    );

  }

  catch {

    alert(
      "Update failed."
    );

  }

};

const logout =
() => {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "loginTimestamp"
  );

  router.push(
    "/login"
  );

};

const loadPatientProfile =
async () => {

  const data =
    await api
      .getOwnPortalData();

  patientData.value =
    data.patient ||
    data;

};

const loadDoctorProfile =
async () => {

  const [
    appointments,
    today,
    tasks,
    alerts
  ] =
  await Promise.allSettled([
    api.getAppointments(),
    api.getTodaysAppointments(),
    api.getTasks(),
    api.getAlerts()
  ]);

  doctorStats.value =
  {
    totalAppointments:
      appointments.status === "fulfilled"
        ? appointments.value.length
        : 0,

    todaysAppointments:
      today.status === "fulfilled"
        ? today.value.length
        : 0,

    pendingTasks:
      tasks.status === "fulfilled"
        ? tasks.value.filter(
            t =>
              t.status !==
              "completed"
          ).length
        : 0,

    activeAlerts:
      alerts.status === "fulfilled"
        ? alerts.value.filter(
            a =>
              a.status ===
              "active"
          ).length
        : 0
  };

};

const loadAdminProfile =
async () => {

  const users =
    await api
      .getUsers();

  const patients =
    await api
      .getAllPatients();

  const appointments =
    await api
      .getAppointments();

  adminStats.value =
  {
    totalUsers:
      users.length,

    totalPatients:
      patients.length,

    totalDoctors:
      users.filter(
        u =>
          u.role ===
          "doctor"
      ).length,

    totalAdmins:
      users.filter(
        u =>
          u.role ===
          "admin"
      ).length,

    totalAppointments:
      appointments.length
  };

};

onMounted(async () => {
  try {
    const me = await api.getMe();
    if (me.profilePicture !== user.value?.profilePicture) {
      updateUser({ profilePicture: me.profilePicture });
    }

    if (user.value?.role === "patient") await loadPatientProfile();
    if (user.value?.role === "doctor") await loadDoctorProfile();
    if (user.value?.role === "admin")  await loadAdminProfile();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.profile-container {
  width: 100%;
}

.profile-header-card {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
}

.avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
}

.avatar-placeholder {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.avatar-upload-btn:hover {
  background: #f0f7f4;
}

.avatar-upload-btn.uploading {
  opacity: 0.6;
  cursor: not-allowed;
}

.avatar-hint {
  font-size: 11px;
  color: #888;
  text-align: center;
  max-width: 96px;
  line-height: 1.3;
}

.profile-info {
  flex: 1;
}

.main-content {
  padding: 35px;
  max-width: 1200px;
}

h2 {
  margin-bottom: 25px;
  color: var(--color-primary);
}

.profile-card {
  background: white;

  border-radius: 18px;

  padding: 26px;

  margin-bottom: 22px;

  border-left:
    6px solid
    var(--color-primary);

  box-shadow:
    0 6px 20px
    rgba(0,0,0,.08);

  transition: .25s;
}

.profile-card:hover {
  transform:
    translateY(-2px);
}

.profile-card p {
  display: flex;

  justify-content:
    space-between;

  padding: 10px 0;

  border-bottom:
    1px solid #ececec;
}

.profile-card p:last-child {
  border-bottom: none;
}

.button-row {
  display: flex;

  gap: 15px;

  margin-top: 15px;
}

.action-button,
.logout-button {
  border: none;

  border-radius: 10px;

  padding: 12px 18px;

  cursor: pointer;

  color: white;
}

.action-button {
  background:
    var(--color-primary);
}

.logout-button {
  background:
    #d9534f;
}
</style>