/* Helpers shared by lecturer.js and student-dashboard.js */

const DB_KEY = 'notify_moodle_db';        // localStorage: the simulated Moodle database
const SESSION_KEY = 'notify_student';     // sessionStorage: who is logged in

// localStorage stores text only, so we convert with JSON.parse / JSON.stringify
function loadPosts() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function savePosts(posts) {
  localStorage.setItem(DB_KEY, JSON.stringify(posts));
}

function getStudent() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

// Shows text as text (never as HTML)
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Only allow normal web links (blocks things like javascript:...)
function isSafeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function formatDeadline(iso) {
  if (!iso) return 'No deadline';
  return new Date(iso).toLocaleString([], {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

function priorityBadge(priority) {
  return { High: 'text-bg-danger', Medium: 'text-bg-warning', Low: 'text-bg-primary' }[priority] || 'text-bg-secondary';
}
