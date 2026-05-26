import { ref } from 'vue';

const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'));

function updateUser(patch) {
  currentUser.value = { ...currentUser.value, ...patch };
  localStorage.setItem('user', JSON.stringify(currentUser.value));
}

function getAvatarUrl(filename) {
  if (!filename) return null;
  return `${import.meta.env.VITE_SERVER_URL}/uploads/${filename}`;
}

export { currentUser, updateUser, getAvatarUrl };
