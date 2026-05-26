import { ref } from 'vue';

const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'));

// Re-sync from localStorage (call this after login/logout)
function syncUser() {
  currentUser.value = JSON.parse(localStorage.getItem('user') || 'null');
}

function updateUser(patch) {
  currentUser.value = { ...currentUser.value, ...patch };
  localStorage.setItem('user', JSON.stringify(currentUser.value));
}

function getAvatarUrl(filename) {
  if (!filename) return null;
  const base = import.meta.env.VITE_SERVER_URL.replace(/\/api$/, '');
  return `${base}/uploads/${filename}`;
}

export { currentUser, syncUser, updateUser, getAvatarUrl };
