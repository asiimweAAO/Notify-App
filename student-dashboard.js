/* Student dashboard (read-only).
   Reads the lecturer's posts from localStorage and only "pulls"
   them into this student's feed when they press Sync. */

const student = getStudent();

// Not logged in? Go back to the login page.
if (!student) {
  window.location.replace('login.html');
} else {
  startDashboard();
}

function startDashboard() {
  // Each student keeps their OWN list of already-pulled post ids
  const SYNC_KEY = 'notify_synced_' + student.email;

  let newIds = [];        // ids pulled in the latest sync (for the NEW badge)
  let pendingPost = null; // the card the student clicked, waiting for password check

  const verifyModal = new bootstrap.Modal(document.getElementById('verifyModal'));
  const verifyInput = document.getElementById('verifyPassword');
  const verifyError = document.getElementById('verifyError');

  function loadSynced() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  /* ---------- CONNECT ONCE, THEN AUTO-PULL ---------- */
  // Remembers (per student) that the one-time sync has already been done
  const CONNECT_KEY = 'notify_connected_' + student.email;
  const isConnected = () => localStorage.getItem(CONNECT_KEY) === 'yes';

  let pollTimer = null;

  // The core "pull": copy anything new from Moodle into this student's feed.
  // Used by the first sync AND by the automatic checks afterwards.
  function pullNewItems() {
    const synced = loadSynced();
    const fresh = loadPosts().filter(p => !synced.includes(p.id));
    if (fresh.length === 0) return [];           // nothing new -> stay silent

    localStorage.setItem(SYNC_KEY, JSON.stringify([...synced, ...fresh.map(p => p.id)]));
    newIds = [...newIds, ...fresh.map(p => p.id)];
    render();
    announce(fresh);
    return fresh;
  }

  // Push alerts for a list of newly pulled items
  function announce(fresh) {
    if (fresh.length <= 3) {
      fresh.forEach(p => {
        const label = p.type === 'assignment' ? 'New assignment: ' : 'New announcement: ';
        pushAlert(label + p.title, p.course + (p.deadline ? ' · due ' + formatDeadline(p.deadline) : ''), p.id);
      });
    } else {
      pushAlert('Notify', fresh.length + ' new items pulled from Moodle');
    }
  }

  // The ONE manual step: first-time connection
  function connectToMoodle() {
    const btn = document.getElementById('syncBtn');
    btn.disabled = true;
    btn.textContent = 'Connecting…';
    setStatus('syncing', 'Connecting…');

    setTimeout(() => {                           // pretend network delay
      localStorage.setItem(CONNECT_KEY, 'yes');  // remember: never ask again
      const fresh = pullNewItems();
      if (fresh.length === 0) {
        showToast('Connected to Moodle', 'New items will now arrive automatically.');
      }
      showConnected();
      startAutoPull();
    }, 1000);
  }

  function showConnected() {
    const btn = document.getElementById('syncBtn');
    btn.textContent = '✓ Connected to Moodle';
    btn.disabled = true;
    setStatus('live', 'Connected · auto-sync on');
  }

  // Checks Moodle again and again, so no button press is needed
  function startAutoPull() {
    if (pollTimer) return;
    pollTimer = setInterval(pullNewItems, 5000);          // every 5 seconds

    // Instant update when the lecturer publishes from ANOTHER tab
    window.addEventListener('storage', e => {
      if (e.key === DB_KEY) pullNewItems();
    });
  }

  /* ---------- PUSH ALERTS ---------- */
  function pushAlert(title, body, postId) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const banner = new Notification(title, { body: body });   // desktop / phone banner

      // When the banner is clicked: bring this dashboard tab to the front
      banner.onclick = () => {
        window.focus();
        banner.close();
        if (postId) highlightPost(postId);
      };
    }
    showToast(title, body);                      // in-page fallback, always shown
  }

  // Scrolls to a card and makes it flash briefly so the student can spot it
  function highlightPost(id) {
    const card = document.querySelector('[data-id="' + id + '"]');
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 2500);
  }

  function updateNotifyButton() {
    const btn = document.getElementById('notifyBtn');
    if (!('Notification' in window)) {
      btn.textContent = 'Notifications not supported';
      btn.disabled = true;
    } else if (Notification.permission === 'granted') {
      btn.textContent = '🔔 Notifications on';
      btn.disabled = true;
    } else if (Notification.permission === 'denied') {
      btn.textContent = '🔕 Blocked in browser settings';
      btn.disabled = true;
    } else {
      btn.textContent = '🔔 Enable notifications';
      btn.disabled = false;
    }
  }

  // Browsers only allow this from a click
  function askPermission() {
    Notification.requestPermission().then(() => {
      updateNotifyButton();
      if (Notification.permission === 'granted') {
        new Notification('Notify', { body: 'Notifications are on.' });
      }
    });
  }

  function showToast(title, body) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = '<div class="toast-body"><strong class="d-block">' + esc(title) + '</strong>' + esc(body) + '</div>';
    document.getElementById('toasts').appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  /* ---------- RENDER ---------- */
  function render() {
    const synced = loadSynced();
    // Show only items this student has pulled, newest first
    const feed = loadPosts()
      .filter(p => synced.includes(p.id))
      .sort((a, b) => b.postedAt - a.postedAt);

    document.getElementById('itemCount').textContent = feed.length;

    document.getElementById('feed').innerHTML = feed.length === 0
      ? '<p class="text-center text-white-50 py-4">Nothing here yet. Press “Connect to Moodle” to get started.</p>'
      : feed.map(p => `
        <div class="card notif-card priority-${esc(p.priority.toLowerCase())} mb-3 shadow-sm"
             role="button" tabindex="0" data-id="${esc(p.id)}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="badge ${priorityBadge(p.priority)}">${esc(p.priority)} priority</span>
                <span class="badge text-bg-light border">${p.type === 'assignment' ? 'Assignment' : 'Announcement'}</span>
                ${newIds.includes(p.id) ? '<span class="badge text-bg-success">NEW</span>' : ''}
              </div>
              <small>🔒 Opens in Moodle</small>
            </div>
            <h2 class="h5 card-title mt-2">${esc(p.title)}</h2>
            <p class="card-text small mb-0">${esc(p.course)} · ${p.deadline ? 'Due ' + esc(formatDeadline(p.deadline)) : 'No deadline'}</p>
          </div>
        </div>`).join('');
  }

  function setStatus(mode, text) {
    const badge = document.getElementById('syncStatus');
    const colours = { idle: 'text-bg-secondary', syncing: 'text-bg-warning is-syncing', live: 'text-bg-success' };
    badge.className = 'badge ' + colours[mode];
    badge.textContent = text;
  }

  /* ---------- SECURE REDIRECT ---------- */
  function openVerifyModal(id) {
    pendingPost = loadPosts().find(p => p.id === id);
    if (!pendingPost) return;
    document.getElementById('verifyTarget').textContent = pendingPost.title;
    verifyInput.value = '';
    verifyError.classList.add('d-none');
    verifyModal.show();
  }

  // One listener handles clicks on every card (event delegation)
  const feedBox = document.getElementById('feed');
  feedBox.addEventListener('click', e => {
    const card = e.target.closest('[data-id]');
    if (card) openVerifyModal(card.dataset.id);
  });
  feedBox.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-id]');
      if (card) { e.preventDefault(); openVerifyModal(card.dataset.id); }
    }
  });

  document.getElementById('verifyModal').addEventListener('shown.bs.modal', () => verifyInput.focus());

  document.getElementById('verifyForm').addEventListener('submit', e => {
    e.preventDefault();

    // Compare what was typed with the logged-in student's real password
    const account = findAccount(student.email);

    if (account && verifyInput.value === account.password && pendingPost && isSafeUrl(pendingPost.url)) {
      const url = pendingPost.url;
      pendingPost = null;
      verifyModal.hide();
      window.open(url, '_blank', 'noopener,noreferrer');   // new tab
    } else {
      verifyError.classList.remove('d-none');
      verifyInput.value = '';
      verifyInput.focus();
    }
  });

  /* ---------- START ---------- */
  document.getElementById('studentEmail').textContent = student.email;
  document.getElementById('syncBtn').addEventListener('click', connectToMoodle);
  document.getElementById('notifyBtn').addEventListener('click', askPermission);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('notify_student');
    window.location.href = 'login.html';
  });

  render();
  updateNotifyButton();

  // Already connected before? Catch up on anything missed, then keep listening.
  if (isConnected()) {
    showConnected();
    pullNewItems();
    startAutoPull();
  }
}
