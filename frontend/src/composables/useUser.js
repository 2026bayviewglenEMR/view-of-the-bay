import { ref } from 'vue';

const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'));
const isDarkMode = ref(currentUser.value?.darkMode ?? false);

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

// Apply immediately on module load so theme is set before first render
applyTheme(isDarkMode.value);

function syncUser() {
  currentUser.value = JSON.parse(localStorage.getItem('user') || 'null');
  isDarkMode.value = currentUser.value?.darkMode ?? false;
  applyTheme(isDarkMode.value);
}

function updateUser(patch) {
  currentUser.value = { ...currentUser.value, ...patch };
  localStorage.setItem('user', JSON.stringify(currentUser.value));
  if ('darkMode' in patch) {
    isDarkMode.value = patch.darkMode;
    applyTheme(patch.darkMode);
  }
}

function getAvatarUrl(filename) {
  if (!filename) return null;
  const base = import.meta.env.VITE_SERVER_URL.replace(/\/api$/, '');
  return `${base}/uploads/${filename}`;
}

export { currentUser, isDarkMode, syncUser, updateUser, getAvatarUrl };
