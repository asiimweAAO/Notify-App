/* Shared navbar.
   Every page has <div id="site-nav"></div> and loads this file,
   so the menu is written ONCE and is identical on all pages. */
(function () {
  const loggedIn = !!sessionStorage.getItem('notify_student');
  const page = location.pathname.split('/').pop() || 'index.html';

  const links = [
    { text: 'Home',         href: 'index.html' },
    { text: 'Features',     href: 'index.html#features' },
    { text: 'Solutions',    href: 'index.html#solutions' },
    { text: 'How It Works', href: 'index.html#how-it-works' },
    { text: 'Security',     href: 'index.html#security' },
    { text: 'Team',         href: 'index.html#team' },
    // The last link changes depending on whether a student is logged in
    loggedIn
      ? { text: 'Dashboard', href: 'student-dashboard.html' }
      : { text: 'Log In',    href: 'login.html' }
  ];

  const items = links.map(link => {
    const isActive = link.href === page;
    const cls = isActive ? 'nav-link active' : 'nav-link';
    const current = isActive ? ' aria-current="page"' : '';
    return `<li class="nav-item"><a class="${cls}"${current} href="${link.href}">${link.text}</a></li>`;
  }).join('');

  document.getElementById('site-nav').innerHTML = `
    <header>
      <nav class="navbar navbar-expand-lg navbar-dark site-navbar">
        <div class="container">
          <a class="navbar-brand fw-bold" href="index.html" aria-label="Notify home">NOTIFY</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarNav" aria-controls="navbarNav"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">${items}</ul>
          </div>
        </div>
      </nav>
    </header>`;
})();
