const form = document.getElementById('publishForm');
const statusBox = document.getElementById('status');
const typeSelect = document.getElementById('type');
const deadlineInput = document.getElementById('deadline');

// Announcements do not need a deadline, assignments do
typeSelect.addEventListener('change', () => {
  deadlineInput.required = typeSelect.value === 'assignment';
});

function showStatus(kind, message) {
  statusBox.className = 'alert alert-' + kind;   // alert-success or alert-danger
  statusBox.textContent = message;
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const course = document.getElementById('course').value.trim();
  const title = document.getElementById('title').value.trim();
  const url = document.getElementById('url').value.trim();

  // Basic checks
  if (!course || !title || !url) {
    showStatus('danger', 'Please fill in the course, title and Moodle URL.');
    return;
  }
  if (typeSelect.value === 'assignment' && !deadlineInput.value) {
    showStatus('danger', 'Please choose a deadline for the assignment.');
    return;
  }
  if (!isSafeUrl(url)) {
    showStatus('danger', 'The Moodle URL must start with http:// or https://');
    return;
  }

  // Build the item that will be "stored in Moodle"
  const post = {
    id: 'p' + Date.now(),                 // unique id
    type: typeSelect.value,
    course: course,
    title: title,
    deadline: deadlineInput.value,        // "" for announcements without a deadline
    priority: document.getElementById('priority').value,
    url: url,
    postedAt: Date.now()
  };

  // Read the list, add the new post, save the list back
  const posts = loadPosts();
  posts.push(post);
  savePosts(posts);

  form.reset();
  deadlineInput.required = true;
  showStatus('success', '“' + title + '” was published to Moodle. Students will receive it on their next sync.');
  render();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  localStorage.removeItem(DB_KEY);
  showStatus('success', 'All published items were cleared.');
  render();
});

function render() {
  const posts = loadPosts().slice().reverse();   // newest first
  document.getElementById('count').textContent = posts.length;

  document.getElementById('postList').innerHTML = posts.length === 0
    ? '<p class="small text-white-50">Nothing published yet.</p>'
    : posts.map(p => `
      <div class="card mb-2 shadow-sm">
        <div class="card-body py-2 d-flex justify-content-between align-items-center gap-2">
          <div>
            <strong class="d-block">${esc(p.title)}</strong>
            <small>${esc(p.course)} · ${p.type === 'assignment' ? 'Due ' + esc(formatDeadline(p.deadline)) : 'Announcement'}</small>
          </div>
          <span class="badge ${priorityBadge(p.priority)}">${esc(p.priority)}</span>
        </div>
      </div>`).join('');
}

render();
