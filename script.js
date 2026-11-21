const API = 'http://localhost:8080/api';
const $ = id => document.getElementById(id);
const TARGET = 100;
const PASS_PERCENT = 75;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let username = '', stream = null, studentMap = null, facultyMap = null, eventLayer = null, facultyMarker = null, userMarker = null;

const read = (key, fallback = []) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const events = () => read('aicte_events');
const records = () => read('aicte_records');
const getOdRequests = () => read('cl_od_requests');
const getAuditLogs = () => read('cl_audit_logs');

/* =====================================================================
   40 STUDENTS ACROSS 4 DIVISIONS (A-01..A-10, B-01..B-10, C-01..C-10, D-01..D-10)
   Passwords: DIVA, DIVB, DIVC, DIVD | Faculty: demo123
   ===================================================================== */
const ACCOUNTS = {
  'faculty':  { pass: 'demo123', name: 'Faculty Member', div: 'CSE-A', roll: 'FAC' },
  'aditi':    { pass: 'demo123', name: 'Aditi Singh',    div: 'CSE-A', roll: 'A-01' },
  'student2': { pass: 'demo123', name: 'Student Two',    div: 'CSE-A', roll: 'A-02' },

  // Division A (CSE-A) -> Password: DIVA
  'a-01': { pass: 'DIVA', name: 'Aditi Singh',       div: 'CSE-A', roll: 'A-01' },
  'a-02': { pass: 'DIVA', name: 'Aarav Sharma',      div: 'CSE-A', roll: 'A-02' },
  'a-03': { pass: 'DIVA', name: 'Ananya Nair',       div: 'CSE-A', roll: 'A-03' },
  'a-04': { pass: 'DIVA', name: 'Arjun Patel',       div: 'CSE-A', roll: 'A-04' },
  'a-05': { pass: 'DIVA', name: 'Avani Deshmukh',    div: 'CSE-A', roll: 'A-05' },
  'a-06': { pass: 'DIVA', name: 'Aditya Verma',      div: 'CSE-A', roll: 'A-06' },
  'a-07': { pass: 'DIVA', name: 'Akash Gupta',       div: 'CSE-A', roll: 'A-07' },
  'a-08': { pass: 'DIVA', name: 'Amrita Joshi',      div: 'CSE-A', roll: 'A-08' },
  'a-09': { pass: 'DIVA', name: 'Aryan Kulkarni',    div: 'CSE-A', roll: 'A-09' },
  'a-10': { pass: 'DIVA', name: 'Isha Mehta',        div: 'CSE-A', roll: 'A-10' },

  // Division B (CSE-B) -> Password: DIVB
  'b-01': { pass: 'DIVB', name: 'Bhavya Shah',       div: 'CSE-B', roll: 'B-01' },
  'b-02': { pass: 'DIVB', name: 'Bharat Iyer',       div: 'CSE-B', roll: 'B-02' },
  'b-03': { pass: 'DIVB', name: 'Bhumi Reddy',       div: 'CSE-B', roll: 'B-03' },
  'b-04': { pass: 'DIVB', name: 'Brijesh Rao',       div: 'CSE-B', roll: 'B-04' },
  'b-05': { pass: 'DIVB', name: 'Barkha Malhotra',   div: 'CSE-B', roll: 'B-05' },
  'b-06': { pass: 'DIVB', name: 'Bhavesh Choudhary', div: 'CSE-B', roll: 'B-06' },
  'b-07': { pass: 'DIVB', name: 'Bipasha Sen',       div: 'CSE-B', roll: 'B-07' },
  'b-08': { pass: 'DIVB', name: 'Badal Thakur',      div: 'CSE-B', roll: 'B-08' },
  'b-09': { pass: 'DIVB', name: 'Bhavana Menon',     div: 'CSE-B', roll: 'B-09' },
  'b-10': { pass: 'DIVB', name: 'Bhanu Pratap',      div: 'CSE-B', roll: 'B-10' },

  // Division C (CSE-C) -> Password: DIVC
  'c-01': { pass: 'DIVC', name: 'Chirag Agarwal',    div: 'CSE-C', roll: 'C-01' },
  'c-02': { pass: 'DIVC', name: 'Chaitali Sawant',   div: 'CSE-C', roll: 'C-02' },
  'c-03': { pass: 'DIVC', name: 'Chetan Kapoor',     div: 'CSE-C', roll: 'C-03' },
  'c-04': { pass: 'DIVC', name: 'Charvi Parekh',     div: 'CSE-C', roll: 'C-04' },
  'c-05': { pass: 'DIVC', name: 'Chandan Mishra',    div: 'CSE-C', roll: 'C-05' },
  'c-06': { pass: 'DIVC', name: 'Chhavi Saxena',     div: 'CSE-C', roll: 'C-06' },
  'c-07': { pass: 'DIVC', name: 'Chinmay Gokhale',   div: 'CSE-C', roll: 'C-07' },
  'c-08': { pass: 'DIVC', name: 'Chetna Tiwari',     div: 'CSE-C', roll: 'C-08' },
  'c-09': { pass: 'DIVC', name: 'Chiranjeev Das',    div: 'CSE-C', roll: 'C-09' },
  'c-10': { pass: 'DIVC', name: 'Charulata Bose',    div: 'CSE-C', roll: 'C-10' },

  // Division D (CSE-D) -> Password: DIVD
  'd-01': { pass: 'DIVD', name: 'Deepak Pandey',     div: 'CSE-D', roll: 'D-01' },
  'd-02': { pass: 'DIVD', name: 'Divya Shetty',      div: 'CSE-D', roll: 'D-02' },
  'd-03': { pass: 'DIVD', name: 'Darshan Jain',      div: 'CSE-D', roll: 'D-03' },
  'd-04': { pass: 'DIVD', name: 'Disha Chatterjee',  div: 'CSE-D', roll: 'D-04' },
  'd-05': { pass: 'DIVD', name: 'Devendra Shinde',   div: 'CSE-D', roll: 'D-05' },
  'd-06': { pass: 'DIVD', name: 'Damini Ahuja',      div: 'CSE-D', roll: 'D-06' },
  'd-07': { pass: 'DIVD', name: 'Dhruv Hegde',       div: 'CSE-D', roll: 'D-07' },
  'd-08': { pass: 'DIVD', name: 'Drishti Batra',     div: 'CSE-D', roll: 'D-08' },
  'd-09': { pass: 'DIVD', name: 'Dinesh Nambiar',    div: 'CSE-D', roll: 'D-09' },
  'd-10': { pass: 'DIVD', name: 'Deeksha Gill',      div: 'CSE-D', roll: 'D-10' }
};

const STUDENT_LOGINS = Object.keys(ACCOUNTS).filter(k => /^[a-d]-\d{2}$/.test(k));

const names = Object.fromEntries(Object.entries(ACCOUNTS).map(([k, v]) => [k, v.name]));
const displayName = n => {
  if (!n) return '';
  const key = String(n).toLowerCase();
  if (names[key]) return names[key];
  const rosterMatch = getAllRoster().find(s => s.id === key);
  return rosterMatch ? rosterMatch.name : n;
};
const initials = n => displayName(n).split(/\s+/).map(x => x[0] || '').join('').slice(0, 2).toUpperCase() || 'ST';
const isFaculty = () => username === 'faculty';
const currentDivision = () => {
  if (!isFaculty() && username && ACCOUNTS[username]?.div) {
    return ACCOUNTS[username].div;
  }
  return ($('global-division') && $('global-division').value) || 'CSE-A';
};
function validateLocalAuth(u, p) {
  const acc = ACCOUNTS[u.toLowerCase()];
  return Boolean(acc && acc.pass.toLowerCase() === String(p || '').trim().toLowerCase());
}

function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.className = 'toast show';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.className = 'toast', 2800);
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function dateParts(value) {
  if (!value) return { day: '--', month: 'TBA' };
  const d = new Date(value + 'T12:00:00');
  return { day: d.getDate(), month: d.toLocaleString('en', { month: 'short' }) };
}

function statusClass(status) {
  return status === 'Approved' ? 'status-approved' : status === 'Rejected' ? 'status-rejected' : '';
}

async function api(path, options = {}) {
  const token = localStorage.getItem('aicte_token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = 'Bearer ' + token;
  const r = await fetch(API + path, { ...options, headers });
  let d = {};
  try { d = await r.json(); } catch {}
  if (!r.ok) throw Error(d.message || 'Request failed');
  return d;
}

function login(usernameValue) {
  username = usernameValue.toLowerCase();
  localStorage.setItem('aicte_username', username);
  $('login-view').hidden = true;
  $('dashboard-view').hidden = false;

  const acc = ACCOUNTS[username];
  if ($('global-division')) {
    if (acc && acc.div && username !== 'faculty') {
      $('global-division').value = acc.div;
      $('global-division').disabled = true;
    } else {
      $('global-division').disabled = false;
    }
  }

  const rollTag = acc && acc.roll && username !== 'faculty' ? ` (${acc.roll})` : '';
  $('profile-name').textContent = displayName(username) + rollTag;
  $('profile-role').textContent = username === 'faculty' ? 'Faculty' : `Student · ${currentDivision()}`;
  $('avatar').textContent = initials(username);
  $('role-label').textContent = username === 'faculty' ? 'FACULTY WORKSPACE' : `STUDENT SPACE · ${currentDivision()}`;
  $('page-title').textContent = 'Your overview';
  $('welcome-title').innerHTML = `Hey ${escapeHtml(displayName(username).split(' ')[0])}, ready to grow? <span>✌</span>`;

  document.querySelectorAll('.faculty-nav').forEach(el => el.hidden = username !== 'faculty');
  document.querySelectorAll('.student-nav').forEach(el => el.hidden = username === 'faculty');
  applyRoleLayout();

  if (username === 'faculty') {
    $('welcome-kicker').textContent = 'YOUR CAMPUS, YOUR IMPACT';
  } else {
    $('welcome-kicker').textContent = 'YOUR JOURNEY, YOUR PACE';
  }

  render();
  showSection('overview');
  setTimeout(initMaps, 180);
  if (username !== 'faculty' && !sessionStorage.getItem('announcementsShown')) {
    sessionStorage.setItem('announcementsShown', '1');
    setTimeout(() => openAnnouncements(), 700);
  }
}

function logout() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if ($('camera')) $('camera').hidden = true;
  localStorage.removeItem('aicte_token');
  localStorage.removeItem('aicte_username');
  username = '';
  $('dashboard-view').hidden = true;
  $('login-view').hidden = false;
}

function showSection(section) {
  document.querySelectorAll('.page-section').forEach(s => s.hidden = s.id !== section + '-section');
  document.querySelectorAll('.nav-item[data-section]').forEach(b => b.classList.toggle('active', b.dataset.section === section));
  const titles = {
    overview: 'Your overview',
    activities: username === 'faculty' ? 'Activity details' : 'Explore activities',
    records: username === 'faculty' ? 'Activity records' : 'My activity records',
    students: 'Student records',
    manage: 'Manage events',
    attendance: 'Attendance & bunk predictor',
    register: 'Attendance register',
   marks: username === 'faculty' ? 'Practical & FA marks sheet' : 'My practical & FA marks',
    calendar: 'Combined calendar',
    timetable: 'Class timetable',
    syllabus: username === 'faculty' ? 'Syllabus coverage' : 'My syllabus tracker',
    todo: 'To-do list',
    deadlines: 'Submission deadlines'
  };
  $('page-title').textContent = titles[section] || 'Your overview';
  if (section === 'overview' || section === 'manage') {
    setTimeout(() => {
      if (studentMap) studentMap.invalidateSize();
      if (facultyMap) facultyMap.invalidateSize();
    }, 150);
  }
  if (section === 'activities') renderEventCards();
  renderAcademic(section);
}

function render() {
  renderOverview();
  renderAnnouncements();
  renderEventCards();
  renderMyRecords();
  renderFacultyRecords();
  renderManageEvents();
  renderTips();
  updateNavCount();
  populateEventSelect();
  updateMapMarkers();
  renderAcademic();
}

function myRecords() {
  return records().filter(r => r.student === username);
}

function approvedPoints(list) {
  return list.filter(r => r.status === 'Approved').reduce((sum, r) => sum + Number(r.points || 0), 0);
}

function renderOverview() {
  const mine = myRecords(),
    approved = mine.filter(r => r.status === 'Approved'),
    pending = mine.filter(r => r.status === 'Pending'),
    upcoming = events().filter(e => e.status !== 'Completed' && (!e.date || e.date >= new Date().toISOString().slice(0, 10)));
  const points = approvedPoints(mine),
    percent = Math.min(100, Math.round(points / TARGET * 100));
  $('points').textContent = points;
  $('target').textContent = TARGET;
  $('approved-count').textContent = isFaculty() ? records().filter(r => r.status === 'Approved').length : approved.length;
  $('pending-count').textContent = isFaculty() ? records().filter(r => r.status === 'Pending').length : pending.length;
  $('upcoming-count').textContent = upcoming.length;
  $('progress-percent').textContent = percent + '%';
  $('ring-value').textContent = points;
  $('bar').style.width = percent + '%';
  $('progress-ring').style.background = `conic-gradient(#6d55e8 ${percent * 3.6}deg,#ece9fb 0deg)`;
  $('points-caption').textContent = points >= TARGET ? 'Target reached — amazing!' : `${TARGET - points} points to go`;
  $('goal-message').textContent = points >= TARGET ? '🎉 You reached your activity-point target!' : `You need ${TARGET - points} more points to reach your target.`;
  $('milestone-copy').textContent = points >= TARGET ? 'Keep going and help your campus grow.' : points >= 50 ? 'Halfway there — keep your momentum!' : 'Start with one activity this week.';
  $('activity-total').textContent = events().length + ' activities';
}

function eventCard(e, index = 0) {
  const d = dateParts(e.date);
  const emoji = ['🌱', '🎨', '🧹', '💡', '🌍', '🏆'][index % 6];
  return `<article class="event-card"><div class="event-datebox"><b>${d.day}</b><span>${d.month}</span></div><div class="event-info"><strong>${escapeHtml(e.name)}</strong><p>${escapeHtml(e.venue || 'Campus venue')} · ${Number(e.duration) || 0} hour(s)${e.description ? ' · ' + escapeHtml(e.description) : ''}</p></div><span class="event-tag">${Number(e.duration) >= 3 ? '+5 POINTS' : 'EVENT'}</span></article>`;
}

function renderAnnouncements() {
  const upcoming = events().filter(e => e.status !== 'Completed' && (!e.date || e.date >= new Date().toISOString().slice(0, 10))).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  $('announcements').innerHTML = upcoming.length ? upcoming.slice(0, 3).map(eventCard).join('') : '<p class="muted">No upcoming activities yet. Faculty can publish events from Manage events.</p>';
  $('modal-announcements').innerHTML = upcoming.length ? upcoming.map(eventCard).join('') : '<p class="muted">No announcements yet. Check back soon!</p>';
}

function renderEventCards() {
  if (isFaculty()) {
    renderActivityInfo();
    return;
  }
  const list = $('all-activities');
  if (!list) return;
  const all = events().filter(e => e.status !== 'Completed').sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  list.innerHTML = all.length ? all.map((e, i) => {
    const already = records().some(r => r.student === username && r.eventId === e.id);
    return `<article class="activity-card"><div class="activity-cover"><span>${['🌱', '🎨', '🧹', '💡', '🌍', '🏆'][i % 6]}</span><span>${Number(e.duration) >= 3 ? '+5 POINTS' : 'CAMPUS EVENT'}</span></div><div class="activity-body"><h3>${escapeHtml(e.name)}</h3><p>${escapeHtml(e.description || 'Join your campus community and make a positive impact.')}</p><div class="activity-meta"><span>📅 ${escapeHtml(e.date || 'Date TBA')}</span><span>⏱ ${Number(e.duration) || 0} hours</span><span>📍 ${escapeHtml(e.venue || 'Campus')}</span></div><button class="btn ${already ? 'btn-outline' : 'btn-primary'}" data-event-checkin="${e.id}" ${already ? 'disabled' : ''}>${already ? 'Submitted ✓' : 'Check in / Scan code ↗'}</button></div></article>`;
  }).join('') : '<div class="panel"><h3>No events published yet</h3><p class="muted">Upcoming campus activities will appear here when faculty adds them.</p></div>';
}

function renderMyRecords() {
  const body = $('my-records');
  if (!body) return;
  const mine = myRecords().slice().reverse();
  body.innerHTML = mine.length ? mine.map(r => `<tr>
    <td><strong>${escapeHtml(r.event)}</strong></td>
    <td><span class="tag tag-good">${escapeHtml(catOf(r))}</span></td>
    <td>${escapeHtml(r.date || '—')}</td>
    <td><b>${Number(r.points) || 0}</b> pts</td>
    <td>${r.proofName ? `<span class="tag tag-od">📎 ${escapeHtml(r.proofName)}</span>` : `<small>${Number(r.duration) || 0} hrs QR</small>`}</td>
    <td><span class="status-pill ${statusClass(r.status)}">${escapeHtml(r.status)}</span></td>
  </tr>`).join('') : '<tr><td colspan="6">No activity records yet. Upload a certificate above or scan an event QR code below.</td></tr>';
}

function renderFacultyRecords() {
  if (!isFaculty()) return;
  const all = records();
  const divStudents = getRoster().map(s => s.id);
  const search = ($('student-search')?.value || '').toLowerCase();
  const filtered = divStudents.filter(n => {
    const roll = ACCOUNTS[n]?.roll || n.toUpperCase();
    return (displayName(n) + ' ' + n + ' ' + roll).toLowerCase().includes(search);
  });

  $('faculty-student-count').textContent = divStudents.length;
  $('faculty-total-students').textContent = divStudents.length;
  $('faculty-total-points').textContent = all.filter(r => r.status === 'Approved').reduce((s, r) => s + (Number(r.points) || 0), 0);

  const pendingCerts = all.filter(r => r.status === 'Pending');
  const pendingOds = getOdRequests().filter(o => o.status === 'Pending');
  $('faculty-pending-count').textContent = pendingCerts.length + pendingOds.length;

  $('student-records').innerHTML = filtered.map(n => {
    const mine = all.filter(r => r.student === n),
      points = approvedPoints(mine),
      progress = Math.min(100, points),
      roll = ACCOUNTS[n]?.roll || n.toUpperCase();
    return `<tr data-student-id="${escapeHtml(n)}">
      <td><strong>${escapeHtml(displayName(n))}</strong><br><small>${escapeHtml(roll)} · ${escapeHtml(ACCOUNTS[n]?.div || currentDivision())}</small></td>
      <td>${mine.length}</td>
      <td><b>${points}</b> / 100</td>
      <td>${mine.filter(r => r.status === 'Pending').length}</td>
      <td><div style="height:7px;background:#efedf8;border-radius:9px;overflow:hidden;min-width:80px"><div style="width:${progress}%;height:100%;background:linear-gradient(90deg,#6d55e8,#ff8db8)"></div></div><small>${progress}%</small></td>
    </tr>`;
  }).join('') || '<tr><td colspan="5">No matching students in this division.</td></tr>';

  $('approval-count').textContent = pendingCerts.length + ' waiting';
  $('pending-approvals').innerHTML = pendingCerts.length ? pendingCerts.map(r => {
    const roll = ACCOUNTS[r.student]?.roll || r.student.toUpperCase();
    return `<div class="approval-row"><div><strong>${escapeHtml(roll)} · ${escapeHtml(displayName(r.student))} — ${escapeHtml(r.event)}</strong><small>${escapeHtml(catOf(r))} · ${Number(r.points) || 0} point(s) · ${escapeHtml(r.date || '')}${r.proofName ? ' · Proof: ' + escapeHtml(r.proofName) : ''}</small></div><div class="approval-actions"><button class="mini-btn" data-approve="${r.id}">Approve</button><button class="mini-btn reject" data-reject="${r.id}">Reject</button></div></div>`;
  }).join('') : '<p class="muted">No records waiting for approval.</p>';

  if ($('od-pending-count')) $('od-pending-count').textContent = pendingOds.length + ' waiting';
  if ($('pending-od-list')) {
    $('pending-od-list').innerHTML = pendingOds.length ? pendingOds.map(o => {
      const roll = ACCOUNTS[o.student]?.roll || o.student.toUpperCase();
      return `<div class="approval-row"><div><strong>${escapeHtml(roll)} · ${escapeHtml(displayName(o.student))} (${escapeHtml(o.type)})</strong><small>${escapeHtml(o.start)} to ${escapeHtml(o.end)} · ${escapeHtml(o.reason)}</small></div><div class="approval-actions"><button class="mini-btn" data-od-approve="${o.id}">Approve OD</button><button class="mini-btn reject" data-od-reject="${o.id}">Reject</button></div></div>`;
    }).join('') : '<p class="muted">No pending OD or Leave applications.</p>';
  }
}

function renderManageEvents() {
  if (!isFaculty()) return;
  const list = events();
  $('all-events').innerHTML = list.length ? list.map(e => `<div class="event-card"><div class="event-datebox"><b>${dateParts(e.date).day}</b><span>${dateParts(e.date).month}</span></div><div class="event-info"><strong>${escapeHtml(e.name)}</strong><p>${escapeHtml(e.date || 'Date TBA')} · ${Number(e.duration) || 0}h · Code: ${escapeHtml(e.qr)}</p></div><button class="mini-btn reject" data-delete-event="${e.id}">Delete</button></div>`).join('') : '<p class="muted">No events yet. Add your first campus activity.</p>';
}

function renderTips() {
  const points = approvedPoints(myRecords()),
    pending = myRecords().filter(r => r.status === 'Pending').length,
    upcoming = events().filter(e => e.status !== 'Completed' && (!e.date || e.date >= new Date().toISOString().slice(0, 10))).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  let tip;
  if (isFaculty()) tip = 'Faculty tip: switch between CSE-A, CSE-B, CSE-C, and CSE-D using the Class selector in the top bar to view each division’s 10 students.';
  else if (points >= TARGET) tip = 'You have reached your 100-point target! Keep participating and encourage your classmates to join campus initiatives.';
  else if (pending) tip = `You have ${pending} submission(s) waiting for faculty approval. While you wait, explore an upcoming activity${upcoming[0] ? ' like “' + upcoming[0].name + '”' : ''}.`;
  else if (upcoming[0]) tip = `Try “${upcoming[0].name}” on ${upcoming[0].date || 'the announced date'}. Check the venue and submit the event QR code while inside the allowed location.`;
  else tip = 'Upload your AICTE activity certificates under My records or scan an event QR code at the venue to earn points.';
  $('ai-tip').textContent = tip;
}

function updateNavCount() {
  $('nav-event-count').textContent = events().filter(e => e.status !== 'Completed').length;
  $('announcement-dot').style.display = events().length ? 'block' : 'none';
}

function populateEventSelect() {
  const sel = $('student-event-select');
  if (!sel) return;
  const previous = sel.value;
  sel.innerHTML = '<option value="">Choose an event</option>' + events().filter(e => e.status !== 'Completed').map(e => `<option value="${e.id}">${escapeHtml(e.name)} · ${escapeHtml(e.date || 'TBA')}</option>`).join('');
  if (previous) sel.value = previous;
}

function distance(lat1, lon1, lat2, lon2) {
  const rad = x => x * Math.PI / 180,
    dLat = rad(lat2 - lat1),
    dLon = rad(lon2 - lon1),
    a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(Error('This browser does not support location.'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
}

async function verifyLocation(e) {
  $('location-status').textContent = '📍 Checking your current location…';
  try {
    const pos = await getPosition(),
      dist = distance(pos.coords.latitude, pos.coords.longitude, e.lat, e.lon);
    if (userMarker && studentMap) userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
    if (studentMap) studentMap.setView([pos.coords.latitude, pos.coords.longitude], 16);
    if (dist > Number(e.radius || 100)) {
      const msg = `Outside the event area — ${Math.round(dist)} m away; allowed radius is ${e.radius || 100} m.`;
      $('location-status').textContent = '⚠️ ' + msg;
      return { ok: false, position: pos, distance: dist };
    }
    const msg = `Inside the event area for ${e.name} (${Math.round(dist)} m away).`;
    $('location-status').textContent = '✅ ' + msg;
    return { ok: true, position: pos, distance: dist };
  } catch (err) {
    const msg = err.code === 1 ? 'Location permission denied. Allow location in browser settings.' : 'Could not get location. Try again outdoors and allow location access.';
    $('location-status').textContent = '⚠️ ' + msg;
    return { ok: false, error: err };
  }
}

async function submitCheckin(eventId, code) {
  const e = events().find(x => String(x.id) === String(eventId)) || events().find(x => x.qr.toLowerCase() === String(code || '').trim().toLowerCase());
  if (!e) { toast('Choose an event and enter its correct QR/event code.'); return; }
  if (String(code || '').trim().toLowerCase() !== String(e.qr).trim().toLowerCase()) { toast('Event code does not match.'); return; }
  const already = records().some(r => r.student === username && String(r.eventId) === String(e.id));
  if (already) { toast('You already submitted this event.'); return; }
  const check = await verifyLocation(e);
  if (!check.ok) {
    if (check.distance !== undefined) toast('You must be inside the event location to check in.');
    return;
  }
  const points = Number(e.duration) >= 3 ? 5 : 2;
  const all = records();
  all.push({
    id: Date.now(),
    student: username,
    eventId: e.id,
    event: e.name,
    category: e.category || 'General',
    date: e.date,
    duration: Number(e.duration),
    points,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    distanceMetres: Math.round(check.distance)
  });
  save('aicte_records', all);
  render();
  toast('Attendance submitted. Faculty approval is pending.');
}

function initMaps() {
  if (!window.L) return;
  if ($('map') && !studentMap) {
    studentMap = L.map('map', { scrollWheelZoom: false }).setView([19.076, 72.8777], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(studentMap);
    eventLayer = L.layerGroup().addTo(studentMap);
    setTimeout(() => { if (studentMap) studentMap.invalidateSize(); }, 250);
  }
  if ($('faculty-map') && !facultyMap) {
    facultyMap = L.map('faculty-map', { scrollWheelZoom: false }).setView([19.076, 72.8777], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(facultyMap);
    facultyMap.on('click', e => setFacultyCoords(e.latlng.lat, e.latlng.lng));
    setFacultyCoords(Number($('event-lat').value) || 19.076, Number($('event-lon').value) || 72.8777);
    setTimeout(() => { if (facultyMap) facultyMap.invalidateSize(); }, 250);
  }
  updateMapMarkers();
}

function updateMapMarkers() {
  if (!window.L) return;
  if (eventLayer) {
    eventLayer.clearLayers();
    events().forEach(e => {
      if (Number.isFinite(Number(e.lat)) && Number.isFinite(Number(e.lon))) {
        L.marker([Number(e.lat), Number(e.lon)]).bindPopup(`<b>${escapeHtml(e.name)}</b><br>${escapeHtml(e.venue || 'Campus venue')}<br>Allowed radius: ${Number(e.radius) || 100} m`).addTo(eventLayer);
      }
    });
  }
  if (facultyMap && facultyMarker) {
    facultyMarker.setLatLng([Number($('event-lat').value) || 19.076, Number($('event-lon').value) || 72.8777]);
  }
}

function setFacultyCoords(lat, lon) {
  $('event-lat').value = Number(lat).toFixed(6);
  $('event-lon').value = Number(lon).toFixed(6);
  if (facultyMap) {
    if (facultyMarker) facultyMarker.setLatLng([lat, lon]);
    else facultyMarker = L.marker([lat, lon], { draggable: true }).addTo(facultyMap);
    facultyMap.setView([lat, lon], 15);
    facultyMarker.off('dragend').on('dragend', e => {
      const p = e.target.getLatLng();
      $('event-lat').value = p.lat.toFixed(6);
      $('event-lon').value = p.lng.toFixed(6);
    });
  }
  $('faculty-map-status').textContent = `Selected location: ${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}. Click or drag the marker to adjust.`;
}

function openAnnouncements() { $('announcement-modal').hidden = false; renderAnnouncements(); }
function closeAnnouncements() { $('announcement-modal').hidden = true; }

/* ---------- LOGIN & DEMO CHIPS ---------- */
$('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const u = $('username').value.trim().toLowerCase(),
    p = $('password').value.trim();
  $('login-error').hidden = true;
  try {
    const d = await api('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    localStorage.setItem('aicte_token', d.token);
    login(u);
  } catch (err) {
    if (validateLocalAuth(u, p)) {
      toast('Logged in (Local Demo Mode).');
      login(u);
    } else {
      $('login-error').textContent = 'Invalid username or password. Use A-01..A-10 (DIVA), B-01..B-10 (DIVB), C-01..C-10 (DIVC), D-01..D-10 (DIVD), or faculty (demo123).';
      $('login-error').hidden = false;
    }
  }
});

document.querySelectorAll('.demo-chip').forEach(b => b.addEventListener('click', () => {
  $('username').value = b.dataset.user;
  $('password').value = b.dataset.pass || 'demo123';
}));
if ($('global-division')) {
  $('global-division').addEventListener('change', () => {
    if ($('tt-division-select')) $('tt-division-select').value = $('global-division').value;
    render();
    toast(`Switched view to ${currentDivision()}`);
  });
}

if ($('tt-division-select')) {
  $('tt-division-select').addEventListener('change', e => {
    if ($('global-division')) $('global-division').value = e.target.value;
    render();
    toast(`Editing timetable for ${currentDivision()}`);
  });
}
if ($('tt-division-select')) {
  $('tt-division-select').addEventListener('change', e => {
    if ($('global-division')) $('global-division').value = e.target.value;
    render();
    toast(`Editing timetable for ${currentDivision()}`);
  });
}
$('logout-btn').addEventListener('click', logout);
document.querySelectorAll('.nav-item[data-section]').forEach(b => b.addEventListener('click', () => showSection(b.dataset.section)));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => showSection(b.dataset.go)));
$('explore-btn').addEventListener('click', () => showSection('activities'));
$('announcement-btn').addEventListener('click', openAnnouncements);
$('close-announcements').addEventListener('click', closeAnnouncements);
$('announcement-modal').addEventListener('click', e => { if (e.target === $('announcement-modal')) closeAnnouncements(); });
$('refresh-tip').addEventListener('click', () => { renderTips(); toast('Suggestion refreshed.'); });

/* ---------- STUDENT CERTIFICATE UPLOAD FORM ---------- */
if ($('student-upload-form')) {
  $('student-upload-form').addEventListener('submit', e => {
    e.preventDefault();
    if (isFaculty()) return;
    const title = $('claim-title').value.trim();
    const category = $('claim-category').value;
    const points = Math.min(20, Math.max(1, Number($('claim-points').value) || 5));
    const date = $('claim-date').value;
    const fileInput = $('claim-file');
    const proofName = fileInput?.files?.[0]?.name || 'certificate.pdf';

    const all = records();
    all.push({
      id: Date.now(),
      student: username,
      event: title,
      category,
      date,
      duration: points * 4,
      points,
      proofName,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    });
    save('aicte_records', all);
    e.target.reset();
    render();
    toast('Certificate uploaded and sent to faculty for approval!');
  });
}

$('event-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!isFaculty()) return;
  const duration = Number($('event-duration').value),
    qr = $('event-qr').value.trim();
  if (events().some(x => x.qr.toLowerCase() === qr.toLowerCase())) {
    toast('Use a unique event code.');
    return;
  }
  const item = {
    id: Date.now(),
    name: $('event-name').value.trim(),
    description: $('event-description').value.trim(),
    date: $('event-date').value,
    duration,
    venue: $('event-venue').value.trim() || 'Campus venue',
    lat: Number($('event-lat').value),
    lon: Number($('event-lon').value),
    radius: Number($('event-radius').value) || 100,
    qr,
    category: $('event-category').value,
    status: 'Upcoming'
  };
  save('aicte_events', [...events(), item]);
  e.target.reset();
  $('event-duration').value = 3;
  $('event-radius').value = 100;
  $('event-lat').value = '19.0760';
  $('event-lon').value = '72.8777';
  setFacultyCoords(19.076, 72.8777);
  render();
  toast('Event published! It now appears in the student portal.');
});

$('student-search').addEventListener('input', renderFacultyRecords);
$('student-event-select').addEventListener('change', () => {
  const e = events().find(x => String(x.id) === $('student-event-select').value);
  if (e) $('qr-code').value = e.qr;
});
$('submit-qr').addEventListener('click', () => {
  const code = $('qr-code').value.trim();
  const e = events().find(x => x.qr.toLowerCase() === code.toLowerCase());
  if (!e) { toast('Event code not recognised.'); return; }
  submitCheckin(e.id, code);
});
$('checkin-btn').addEventListener('click', async () => {
  const e = events().find(x => String(x.id) === $('student-event-select').value) || events().find(x => x.status !== 'Completed');
  if (!e) { $('location-status').textContent = 'No event available to check yet.'; return; }
  await verifyLocation(e);
});
$('locate-map').addEventListener('click', async () => {
  try {
    const pos = await getPosition();
    if (studentMap) {
      studentMap.setView([pos.coords.latitude, pos.coords.longitude], 16);
      if (userMarker) userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
      else userMarker = L.circleMarker([pos.coords.latitude, pos.coords.longitude], { radius: 8, color: '#ff936b', fillColor: '#ff936b', fillOpacity: .9 }).addTo(studentMap).bindPopup('Your location');
    }
  } catch {
    toast('Allow location access to show your position on the map.');
  }
});
$('use-current-location').addEventListener('click', async () => {
  try {
    const pos = await getPosition();
    setFacultyCoords(pos.coords.latitude, pos.coords.longitude);
    $('faculty-map-status').textContent = 'Using your current location as the event venue.';
  } catch {
    toast('Allow location access to use your current position.');
  }
});
$('event-lat').addEventListener('change', updateMapMarkers);
$('event-lon').addEventListener('change', updateMapMarkers);

document.addEventListener('click', e => {
  const a = e.target.closest('[data-approve]'),
    r = e.target.closest('[data-reject]'),
    odA = e.target.closest('[data-od-approve]'),
    odR = e.target.closest('[data-od-reject]'),
    del = e.target.closest('[data-delete-event]'),
    check = e.target.closest('[data-event-checkin]');

  if (a || r) {
    if (!isFaculty()) return;
    const id = Number((a || r).dataset[a ? 'approve' : 'reject']);
    const status = a ? 'Approved' : 'Rejected';
    save('aicte_records', records().map(x => x.id === id ? { ...x, status, reviewedAt: new Date().toISOString() } : x));
    render();
    toast(`Record ${status.toLowerCase()}.`);
  }
  if (odA || odR) {
    if (!isFaculty()) return;
    const id = (odA || odR).dataset[odA ? 'odApprove' : 'odReject'];
    const status = odA ? 'Approved' : 'Rejected';
    const remarks = status === 'Approved' ? 'Sanctioned by Faculty' : 'Declined by Faculty';
    save('cl_od_requests', getOdRequests().map(x => x.id === id ? { ...x, status, remarks } : x));
    render();
    toast(`OD request ${status.toLowerCase()}.`);
  }
  if (del) {
    if (!isFaculty()) return;
    const id = Number(del.dataset.deleteEvent);
    if (!confirm('Delete this event? Existing student records will remain.')) return;
    save('aicte_events', events().filter(x => x.id !== id));
    render();
    toast('Event deleted.');
  }
  if (check) {
    showSection('records');
    $('student-event-select').value = check.dataset.eventCheckin;
    const ev = events().find(x => String(x.id) === check.dataset.eventCheckin);
    if (ev) $('qr-code').value = ev.qr;
    toast('Scan the event QR or use the event code, then submit check-in.');
  }
});

$('scan-btn').addEventListener('click', async () => {
  if (!navigator.mediaDevices?.getUserMedia) { toast('Camera is unavailable. Enter the event code manually.'); return; }
  if (!('BarcodeDetector' in window)) { toast('This browser does not support built-in QR scanning. Enter the event code manually.'); return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = $('camera');
    video.srcObject = stream;
    video.hidden = false;
    await video.play();
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const scan = async () => {
      if (!stream) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length) {
          $('qr-code').value = codes[0].rawValue;
          stream.getTracks().forEach(t => t.stop());
          stream = null;
          video.hidden = true;
          toast('QR captured. Confirm the code and press Submit.');
          return;
        }
      } catch {}
      requestAnimationFrame(scan);
    };
    scan();
  } catch {
    toast('Could not open camera. Allow camera access or enter the code manually.');
  }
});

/* =====================================================================
   ACADEMIC MODULES & DIVISION ROSTERS (A-01..A-10, B-01..B-10, C-01..C-10, D-01..D-10)
   ===================================================================== */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dayOf = dateStr => DAY_NAMES[new Date(dateStr + 'T12:00:00').getDay()];
const friendlyDate = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'No date';
const daysLeft = d => Math.round((new Date(d + 'T00:00:00') - new Date(todayStr() + 'T00:00:00')) / 86400000);

const DEFAULT_TIMETABLE = [
  { id: 't1', day: 'Mon', start: '09:00', end: '10:00', code: 'CS301', subject: 'Data Structures', prof: 'Prof. Mehta', room: 'A-101' },
  { id: 't2', day: 'Mon', start: '10:00', end: '11:00', code: 'CS302', subject: 'Operating Systems', prof: 'Prof. Kulkarni', room: 'A-101' },
  { id: 't3', day: 'Mon', start: '11:15', end: '12:15', code: 'MA301', subject: 'Engineering Maths', prof: 'Prof. Rao', room: 'A-101' },
  { id: 't4', day: 'Tue', start: '09:00', end: '10:00', code: 'CS303', subject: 'Computer Networks', prof: 'Prof. Iyer', room: 'A-102' },
  { id: 't5', day: 'Tue', start: '10:00', end: '11:00', code: 'CS304', subject: 'Cryptography', prof: 'Prof. Deshmukh', room: 'A-102' },
  { id: 't6', day: 'Tue', start: '11:15', end: '12:15', code: 'CS301', subject: 'Data Structures', prof: 'Prof. Mehta', room: 'A-102' },
  { id: 't7', day: 'Wed', start: '09:00', end: '10:00', code: 'CS302', subject: 'Operating Systems', prof: 'Prof. Kulkarni', room: 'A-101' },
  { id: 't8', day: 'Wed', start: '10:00', end: '11:00', code: 'MA301', subject: 'Engineering Maths', prof: 'Prof. Rao', room: 'A-101' },
  { id: 't9', day: 'Wed', start: '11:15', end: '12:15', code: 'CS303', subject: 'Computer Networks', prof: 'Prof. Iyer', room: 'A-101' },
  { id: 't10', day: 'Thu', start: '09:00', end: '10:00', code: 'CS304', subject: 'Cryptography', prof: 'Prof. Deshmukh', room: 'A-102' },
  { id: 't11', day: 'Thu', start: '10:00', end: '11:00', code: 'CS301', subject: 'Data Structures', prof: 'Prof. Mehta', room: 'A-102' },
  { id: 't12', day: 'Thu', start: '11:15', end: '12:15', code: 'CS302', subject: 'Operating Systems', prof: 'Prof. Kulkarni', room: 'A-102' },
  { id: 't13', day: 'Fri', start: '09:00', end: '10:00', code: 'MA301', subject: 'Engineering Maths', prof: 'Prof. Rao', room: 'A-101' },
  { id: 't14', day: 'Fri', start: '10:00', end: '11:00', code: 'CS303', subject: 'Computer Networks', prof: 'Prof. Iyer', room: 'A-101' },
  { id: 't15', day: 'Fri', start: '11:15', end: '12:15', code: 'CS304', subject: 'Cryptography', prof: 'Prof. Deshmukh', room: 'A-101' }
];

const DEFAULT_ROSTER = STUDENT_LOGINS.map(id => ({
  id,
  roll: ACCOUNTS[id].roll,
  name: ACCOUNTS[id].name,
  div: ACCOUNTS[id].div
}));
const ttKey = (div = currentDivision()) => 'cl_timetable_' + div;
const chgKey = (div = currentDivision()) => 'cl_changes_' + div;

function getTimetable(div = currentDivision()) {
  let t = read(ttKey(div), null);
  if (!Array.isArray(t)) {
    const roomSuffix = div.split('-')[1] || 'A';
    t = DEFAULT_TIMETABLE.map(x => ({
      ...x,
      id: x.id + '_' + roomSuffix,
      room: roomSuffix + '-101'
    }));
    save(ttKey(div), t);
  }
  return t;
}
function getAllRoster() {
  let r = read('cl_roster_v2', null);
  if (!Array.isArray(r) || r.length < 40) {
    r = DEFAULT_ROSTER.map(x => ({ ...x }));
    save('cl_roster_v2', r);
  }
  return r;
}

function getRoster() {
  const div = currentDivision();
  return getAllRoster().filter(s => (s.div || 'CSE-A') === div);
}


const getChanges = (div = currentDivision()) => read(chgKey(div), []);
const getAttendance = () => read('cl_attendance');
const sortedSlots = list => list.slice().sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start));

function subjectsList() {
  const map = new Map();
  getTimetable().forEach(s => { if (!map.has(s.code)) map.set(s.code, { code: s.code, name: s.subject }); });
  return [...map.values()];
}

function effectiveLecture(slot, date) {
  const ch = getChanges().find(c => c.date === date && c.slotId === slot.id);
  const out = { code: slot.code, subject: slot.subject, prof: slot.prof, cancelled: false, substitute: false, change: ch || null };
  if (ch && ch.type === 'cancelled') out.cancelled = true;
  if (ch && ch.type === 'substitute') {
    out.substitute = true;
    out.prof = ch.subProf || slot.prof;
    const s = subjectsList().find(x => x.code === ch.countCode);
    if (s) { out.code = s.code; out.subject = s.name; }
  }
  return out;
}

function attendanceStats(student) {
  const slots = getTimetable(), per = {};
  subjectsList().forEach(s => { per[s.code] = { code: s.code, name: s.name, A: 0, T: 0 }; });
  getAttendance().filter(r => r.student === student).forEach(r => {
    const slot = slots.find(s => s.id === r.slotId);
    if (!slot) return;
    const eff = effectiveLecture(slot, r.date);
    if (eff.cancelled || r.status === 'Cancelled') return;
    if (!per[eff.code]) per[eff.code] = { code: eff.code, name: eff.subject, A: 0, T: 0 };
    per[eff.code].T++;
    if (r.status === 'Attended' || r.status === 'OD') per[eff.code].A++;
  });
  const list = Object.values(per);
  return { list, A: list.reduce((s, x) => s + x.A, 0), T: list.reduce((s, x) => s + x.T, 0) };
}

function predictor(A, T) {
  if (!T) return { pct: null, skip: 0, need: 0 };
  const pct = A / T * 100;
  if (100 * A >= PASS_PERCENT * T) {
    return { pct, skip: Math.max(0, Math.floor((100 * A - PASS_PERCENT * T) / PASS_PERCENT)), need: 0 };
  }
  return { pct, skip: 0, need: Math.max(0, Math.ceil((PASS_PERCENT * T - 100 * A) / (100 - PASS_PERCENT))) };
}

/* =====================  STUDENT: ATTENDANCE & OD  ===================== */
function renderAttendance() {
  if (isFaculty()) return;
  const st = attendanceStats(username), p = predictor(st.A, st.T);
  const below = st.T > 0 && 100 * st.A < PASS_PERCENT * st.T;

  $('ac-pct').textContent = p.pct === null ? '—' : p.pct.toFixed(1) + '%';
  $('ac-attended').textContent = st.A;
  $('ac-total').textContent = st.T;
  $('ac-skip-label').textContent = below ? 'Lectures to attend' : 'Safe skips left';
  $('ac-skip').textContent = below ? p.need : p.skip;

  let cls = 'ac-neutral', label = 'No data yet', msg = 'Log your lectures below to see how many you can skip.';
  if (st.T > 0) {
    if (below) {
      cls = 'ac-bad'; label = 'Shortage';
      msg = `You are below ${PASS_PERCENT}%. Attend the next <b>${p.need}</b> lecture(s) in a row to get back to ${PASS_PERCENT}%.`;
    } else if (p.skip <= 1) {
      cls = 'ac-warn'; label = 'On the edge';
      msg = p.skip === 0
        ? `You are right at the limit. Skipping the next lecture would take you below ${PASS_PERCENT}%.`
        : `You can safely skip only <b>1</b> more lecture and stay at or above ${PASS_PERCENT}%.`;
    } else {
      cls = 'ac-good'; label = 'Safe';
      msg = `You can safely skip <b>${p.skip}</b> more lectures and still stay at or above ${PASS_PERCENT}%.`;
    }
  }
  $('ac-status').className = 'ac-badge ' + cls;
  $('ac-status').textContent = label;
  $('ac-message').innerHTML = msg;

  $('ac-subjects').innerHTML = st.list.map(s => {
    const sp = predictor(s.A, s.T), sBelow = s.T > 0 && 100 * s.A < PASS_PERCENT * s.T;
    const pct = s.T ? s.A / s.T * 100 : 0;
    const note = s.T === 0 ? '—' : sBelow ? `Attend next <b>${sp.need}</b>` : `Can skip <b>${sp.skip}</b>`;
    return `<tr><td><strong>${escapeHtml(s.name)}</strong><br><small>${escapeHtml(s.code)}</small></td><td>${s.A}</td><td>${s.T}</td>
      <td><div class="bar ${sBelow ? 'bad' : 'good'}"><i style="width:${Math.min(100, pct)}%"></i></div><small>${s.T ? pct.toFixed(0) + '%' : '—'}</small></td><td>${note}</td></tr>`;
  }).join('') || '<tr><td colspan="5">No subjects yet. Ask faculty to set the timetable.</td></tr>';

  if ($('my-od-records')) {
    const myOds = getOdRequests().filter(o => o.student === username).reverse();
    $('my-od-records').innerHTML = myOds.length ? myOds.map(o => `<tr>
      <td><span class="tag tag-od">${escapeHtml(o.type)}</span></td>
      <td>${escapeHtml(o.start)} → ${escapeHtml(o.end)}</td>
      <td>${escapeHtml(o.reason)}</td>
      <td><span class="status-pill ${statusClass(o.status)}">${escapeHtml(o.status)}</span></td>
      <td><small>${escapeHtml(o.remarks || 'Awaiting review')}</small></td>
    </tr>`).join('') : '<tr><td colspan="5">No Leave or On-Duty requests submitted yet.</td></tr>';
  }

  renderAttendanceCharts(st);
  renderWhatIf(st);
  renderCalendar();
  renderLectureLog();
}

function renderLectureLog() {
  if (isFaculty()) return;
  const input = $('ac-date');
  if (!input.value) input.value = todayStr();
  input.max = todayStr();
  const date = input.value;
  const slots = sortedSlots(getTimetable()).filter(s => s.day === dayOf(date));
  const recs = getAttendance().filter(r => r.student === username && r.date === date);

  $('ac-log').innerHTML = slots.length ? slots.map(s => {
    const eff = effectiveLecture(s, date), rec = recs.find(r => r.slotId === s.id);
    const byFaculty = rec && rec.markedBy === 'Faculty';
    const locked = eff.cancelled || byFaculty;
    const cur = eff.cancelled ? 'Cancelled' : rec ? rec.status : '';
    const tag = eff.cancelled ? '<span class="tag tag-bad">Cancelled by faculty</span>'
      : eff.substitute ? `<span class="tag tag-warn">Substitute: ${escapeHtml(eff.prof)}</span>` : '';
    const lock = byFaculty ? '<span class="tag tag-good">Marked by faculty</span>' : '';
    const btn = (status, c) => `<button type="button" class="seg-btn ${c}${cur === status ? ' on' : ''}" data-ac-slot="${s.id}" data-ac-status="${status}" ${locked ? 'disabled' : ''}>${status}</button>`;
    return `<div class="lecture-row"><div class="lecture-info"><strong>${escapeHtml(eff.subject)}</strong>
      <small>${escapeHtml(s.start)}–${escapeHtml(s.end)} · ${escapeHtml(eff.prof)}</small><div>${tag}${lock}</div></div>
      <div class="seg">${btn('Attended', 'att')}${btn('Bunked', 'bun')}${btn('Cancelled', 'can')}</div></div>`;
  }).join('') : `<p class="muted">No lectures scheduled on ${escapeHtml(friendlyDate(date))}.</p>`;
}

function acSetStatus(slotId, status) {
  if (isFaculty()) return;
  const date = $('ac-date').value || todayStr();
  if (date > todayStr()) { toast('You cannot log a lecture in the future.'); return; }
  const all = getAttendance();
  const i = all.findIndex(r => r.student === username && r.date === date && r.slotId === slotId);
  if (i >= 0 && all[i].markedBy === 'Faculty') { toast('Faculty has marked this lecture, so it cannot be changed.'); return; }
  if (i >= 0 && all[i].status === status) all.splice(i, 1);
  else {
    const rec = { student: username, date, slotId, status, markedBy: 'Student', at: new Date().toISOString() };
    if (i >= 0) all[i] = rec; else all.push(rec);
  }
  save('cl_attendance', all);
  renderAttendance();
}

function renderAttendanceCharts(st) {
  $('ac-chart-subjects').innerHTML = st.list.map(s => {
    const pct = s.T ? s.A / s.T * 100 : 0, below = s.T > 0 && 100 * s.A < PASS_PERCENT * s.T;
    const cls = !s.T ? 'none' : below ? 'bad' : 'good';
    return `<div class="hbar"><span class="hbar-label">${escapeHtml(s.code)}</span><div class="hbar-track" title="${escapeHtml(s.name)}: ${s.A}/${s.T}"><i class="${cls}" style="width:${pct}%"></i><u style="left:${PASS_PERCENT}%"></u></div><b>${s.T ? Math.round(pct) + '%' : '—'}</b></div>`;
  }).join('') + `<p class="hint">The red line marks the ${PASS_PERCENT}% minimum.</p>`;

  const slots = getTimetable(), byDate = {};
  getAttendance().filter(r => r.student === username).forEach(r => {
    const slot = slots.find(s => s.id === r.slotId);
    if (!slot || effectiveLecture(slot, r.date).cancelled || r.status === 'Cancelled') return;
    const d = byDate[r.date] = byDate[r.date] || { A: 0, T: 0 };
    d.T++; if (r.status === 'Attended' || r.status === 'OD') d.A++;
  });
  const dates = Object.keys(byDate).sort();
  if (dates.length < 2) { $('ac-chart-trend').innerHTML = '<p class="muted">Log lectures on at least two different days to see your trend.</p>'; return; }
  let A = 0, T = 0;
  const pts = dates.map(d => { A += byDate[d].A; T += byDate[d].T; return { d, pct: A / T * 100 }; });
  const W = 400, H = 180, px = 30, py = 14;
  const x = i => px + i * (W - px - 10) / (pts.length - 1), y = v => H - 24 - v / 100 * (H - 24 - py);
  const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.pct).toFixed(1)}`).join(' ');
  $('ac-chart-trend').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="trend" role="img" aria-label="Attendance percentage over time">
    <line x1="${px}" x2="${W - 10}" y1="${y(PASS_PERCENT)}" y2="${y(PASS_PERCENT)}" stroke="#c64a64" stroke-dasharray="5 4"/>
    <text x="2" y="${y(PASS_PERCENT) + 3}" font-size="9" fill="#c64a64">75%</text>
    <text x="2" y="${y(100) + 3}" font-size="9" fill="#9a98b3">100</text><text x="2" y="${y(0) + 3}" font-size="9" fill="#9a98b3">0</text>
    <polyline points="${line}" fill="none" stroke="#6c55e8" stroke-width="2.5" stroke-linejoin="round"/>
    ${pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.pct).toFixed(1)}" r="3.5" fill="#6c55e8"><title>${p.d}: ${p.pct.toFixed(0)}%</title></circle>`).join('')}
    <text x="${px}" y="${H - 6}" font-size="9" fill="#9a98b3">${escapeHtml(friendlyDate(pts[0].d))}</text>
    <text x="${W - 10}" y="${H - 6}" font-size="9" fill="#9a98b3" text-anchor="end">${escapeHtml(friendlyDate(pts[pts.length - 1].d))}</text></svg>
    <p class="hint">Running attendance after each day you logged lectures.</p>`;
}

/* ---------- OD MODAL ---------- */
if ($('open-od-modal')) {
  $('open-od-modal').addEventListener('click', () => {
    $('od-start').value = todayStr();
    $('od-end').value = todayStr();
    $('od-modal').hidden = false;
  });
}
if ($('close-od-modal')) $('close-od-modal').addEventListener('click', () => $('od-modal').hidden = true);
if ($('od-form')) {
  $('od-form').addEventListener('submit', e => {
    e.preventDefault();
    const item = {
      id: uid(),
      student: username,
      type: $('od-type').value,
      start: $('od-start').value,
      end: $('od-end').value,
      reason: $('od-reason').value.trim(),
      status: 'Pending',
      remarks: 'Pending faculty review'
    };
    save('cl_od_requests', [...getOdRequests(), item]);
    $('od-modal').hidden = true;
    e.target.reset();
    renderAttendance();
    toast('Leave / OD application submitted!');
  });
}

/* =====================  TIMETABLE  ===================== */
/* =====================  TIMETABLE  ===================== */
let ttEditingId = null;

function slotCard(s, fac) {
  const isEditing = fac && ttEditingId === s.id;
  return `<div class="tt-slot${isEditing ? ' is-editing' : ''}"><b>${escapeHtml(s.start)}–${escapeHtml(s.end)}</b>
    <strong>${escapeHtml(s.subject)}</strong><small>${escapeHtml(s.code)} · ${escapeHtml(s.prof)}${s.room ? ' · ' + escapeHtml(s.room) : ''}</small>
    ${fac ? `<div style="display:flex;gap:6px;margin-top:6px;">
      <button type="button" class="mini-btn" data-edit-slot="${s.id}">Edit</button>
      <button type="button" class="mini-btn reject" data-del-slot="${s.id}">Remove</button>
    </div>` : ''}</div>`;
}

function resetTimetableForm() {
  ttEditingId = null;
  if ($('tt-form')) $('tt-form').reset();
  const submitBtn = $('tt-form')?.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.innerHTML = 'Add to timetable <span>↗</span>';
  const cancelBtn = $('tt-cancel-edit');
  if (cancelBtn) cancelBtn.hidden = true;
}
function renderTimetable() {
  const fac = isFaculty(), div = currentDivision();
  if ($('tt-division-select')) $('tt-division-select').value = div;
  $('tt-faculty-tools').hidden = !fac;
  $('tt-chip').textContent = fac ? `Editing ${div}` : `View only · ${div}`;
  const slots = sortedSlots(getTimetable(div));
  $('tt-grid').innerHTML = DAYS.map(d => {
    const list = slots.filter(s => s.day === d);
    return `<div class="tt-day"><h4>${d}</h4>${list.length ? list.map(s => slotCard(s, fac)).join('') : '<p class="muted tt-empty">No lectures</p>'}</div>`;
  }).join('');

  const changes = getChanges().slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25);
  $('tt-changes').innerHTML = changes.length ? changes.map(c => {
    const s = slots.find(x => x.id === c.slotId);
    if (!s) return '';
    const what = c.type === 'cancelled'
      ? '<span class="tag tag-bad">Cancelled</span>'
      : `<span class="tag tag-warn">Substitute: ${escapeHtml(c.subProf || 'another teacher')}</span>`;
    const counted = c.type === 'substitute' && c.countCode && c.countCode !== s.code ? ` · counts under ${escapeHtml(c.countCode)}` : '';
    return `<div class="approval-row"><div><strong>${escapeHtml(friendlyDate(c.date))} · ${escapeHtml(s.start)} ${escapeHtml(s.subject)}</strong>
      <small>${what}${counted}${c.note ? ' · ' + escapeHtml(c.note) : ''}</small></div>
      ${fac ? `<button type="button" class="mini-btn reject" data-del-change="${c.id}">Delete</button>` : ''}</div>`;
  }).join('') : '<p class="muted">No substitutions or cancellations.</p>';

  if (fac) chgFillSlots();
}

function chgFillSlots() {
  const date = $('chg-date').value || todayStr();
  $('chg-date').value = date;
  const sel = $('chg-slot'), prev = sel.value;
  const slots = sortedSlots(getTimetable()).filter(s => s.day === dayOf(date));
  sel.innerHTML = slots.length
    ? slots.map(s => `<option value="${s.id}">${escapeHtml(s.start + ' ' + s.code + ' ' + s.subject)}</option>`).join('')
    : '<option value="">No lectures on this day</option>';
  if (slots.some(s => s.id === prev)) sel.value = prev;
  const cnt = $('chg-count'), prevC = cnt.value;
  cnt.innerHTML = '<option value="">Same subject as the timetable</option>' +
    subjectsList().map(s => `<option value="${escapeHtml(s.code)}">${escapeHtml(s.code + ' ' + s.name)}</option>`).join('');
  cnt.value = prevC;
}

/* =====================  FACULTY: REGISTER & AUDIT TRAIL  ===================== */
let rgState = {};

function rgPrepare() {
  if (!isFaculty()) return;
  const dateInput = $('rg-date');
  if (!dateInput.value) dateInput.value = todayStr();
  const slots = sortedSlots(getTimetable()).filter(s => s.day === dayOf(dateInput.value));
  const sel = $('rg-slot'), prev = sel.value;
  sel.innerHTML = slots.length
    ? slots.map(s => `<option value="${s.id}">${escapeHtml(s.start + '–' + s.end + ' · ' + s.code + ' ' + s.subject)}</option>`).join('')
    : '<option value="">No lectures on this day</option>';
  if (slots.some(s => s.id === prev)) sel.value = prev;
  rgReload();
}

function rgReload() {
  const date = $('rg-date').value, slotId = $('rg-slot').value;
  const att = getAttendance();
  let saved = false;
  rgState = {};
  if (slotId) {
    getRoster().forEach(st => {
      const rec = att.find(r => r.student === st.id && r.date === date && r.slotId === slotId && r.markedBy === 'Faculty');
      if (rec) saved = true;
      rgState[st.id] = rec ? (rec.status === 'Attended' ? 'P' : rec.status === 'OD' ? 'OD' : 'A') : 'P';
    });
  }
  $('rg-note').textContent = !slotId ? 'Choose a date that has a lecture in the timetable.'
    : saved ? `Saved register for ${currentDivision()}. Saving again will update it.` : `Showing ${currentDivision()} roster. Everyone starts as Present; click a status cell to cycle Present → Absent → OD.`;
  renderRegister();
}

function renderRegister() {
  if (!isFaculty()) return;
  const date = $('rg-date').value, slotId = $('rg-slot').value;
  const att = getAttendance(), roster = getRoster();
  $('rg-body').innerHTML = slotId ? roster.map((st, i) => {
    const v = rgState[st.id] || 'P';
    const own = att.find(r => r.student === st.id && r.date === date && r.slotId === slotId && r.markedBy === 'Student');
    const cellCls = v === 'P' ? 'cell-p' : v === 'OD' ? 'cell-od' : 'cell-a';
    const cellTxt = v === 'P' ? 'Present' : v === 'OD' ? 'OD / Leave' : 'Absent';
    return `<tr><td class="rownum">${i + 1}</td><td><b>${escapeHtml(st.roll)}</b></td><td><strong>${escapeHtml(st.name)}</strong></td>
      <td><button type="button" class="cell ${cellCls}" data-rg-toggle="${st.id}">${cellTxt}</button></td>
      <td class="own-log">${own ? escapeHtml(own.status) : '—'}</td><td class="rg-actions"><button type="button" class="mini-btn" data-rg-audit="${st.id}">Audit Edit</button><button type="button" class="mini-btn reject" data-rg-remove="${st.id}">Remove</button></td></tr>`;
  }).join('') : '<tr><td colspan="6">No lecture selected.</td></tr>';

  const vals = Object.values(rgState),
    p = vals.filter(x => x === 'P').length,
    od = vals.filter(x => x === 'OD').length,
    a = vals.filter(x => x === 'A').length;
  $('rg-present').textContent = p;
  $('rg-absent').textContent = a;
  if ($('rg-od')) $('rg-od').textContent = od;
  $('rg-total').textContent = vals.length;
  $('rg-percent').textContent = vals.length ? Math.round((p + od) / vals.length * 100) + '%' : '—';

  renderDefaulters();
  renderAuditTrail();
}

function renderAuditTrail() {
  const tbody = $('rg-audit-trail');
  if (!tbody) return;
  const logs = getAuditLogs().slice().reverse();
  tbody.innerHTML = logs.length ? logs.map(l => `<tr>
    <td><small>${escapeHtml(new Date(l.at).toLocaleString('en-IN'))}</small></td>
    <td>${escapeHtml(l.by)}</td>
    <td>${escapeHtml(l.date)}</td>
    <td><strong>${escapeHtml(l.studentName)}</strong></td>
    <td>${escapeHtml(l.slot)}</td>
    <td><span class="tag tag-warn">${escapeHtml(l.newStatus)}</span></td>
    <td>${escapeHtml(l.reasonCat)}: ${escapeHtml(l.notes)}</td>
  </tr>`).join('') : '<tr><td colspan="7">No historical attendance overrides recorded yet.</td></tr>';
}

function rgSave() {
  if (!isFaculty()) return;
  const date = $('rg-date').value, slotId = $('rg-slot').value;
  if (!slotId) { toast('Choose a lecture first.'); return; }
  const all = getAttendance(), now = new Date().toISOString();
  Object.keys(rgState).forEach(id => {
    const stCode = rgState[id];
    const status = stCode === 'P' ? 'Attended' : stCode === 'OD' ? 'OD' : 'Bunked';
    const rec = { student: id, date, slotId, status, markedBy: 'Faculty', at: now };
    const i = all.findIndex(r => r.student === id && r.date === date && r.slotId === slotId);
    if (i >= 0) all[i] = rec; else all.push(rec);
  });
  save('cl_attendance', all);
  toast(`Register saved for ${Object.keys(rgState).length} students in ${currentDivision()}.`);
  rgReload();
}

/* ---------- AUDIT MODAL ---------- */
if ($('close-audit-modal')) $('close-audit-modal').addEventListener('click', () => $('audit-modal').hidden = true);
if ($('audit-form')) {
  $('audit-form').addEventListener('submit', e => {
    e.preventDefault();
    const stId = $('audit-student-id').value;
    const slotId = $('audit-slot-id').value;
    const date = $('audit-date').value;
    const newStatus = $('audit-status').value;
    const reasonCat = $('audit-reason-cat').value;
    const notes = $('audit-notes').value.trim();

    rgState[stId] = newStatus === 'Attended' ? 'P' : newStatus === 'OD' ? 'OD' : 'A';
    const all = getAttendance();
    const rec = { student: stId, date, slotId, status: newStatus, markedBy: 'Faculty', at: new Date().toISOString() };
    const idx = all.findIndex(r => r.student === stId && r.date === date && r.slotId === slotId);
    if (idx >= 0) all[idx] = rec; else all.push(rec);
    save('cl_attendance', all);

    const slot = getTimetable().find(s => s.id === slotId);
    const logs = getAuditLogs();
    logs.push({
      id: uid(),
      at: new Date().toISOString(),
      by: 'Faculty',
      date,
      studentId: stId,
      studentName: displayName(stId),
      slot: slot ? `${slot.code} (${slot.start})` : slotId,
      newStatus,
      reasonCat,
      notes
    });
    save('cl_audit_logs', logs);

    $('audit-modal').hidden = true;
    $('audit-notes').value = '';
    renderRegister();
    toast('Attendance updated with audit trail.');
  });
}

/* =====================  SYLLABUS TRACKERS  ===================== */
let sySelected = '';
const syKey = () => isFaculty() ? 'cl_fsyllabus' : 'cl_syllabus_' + username;
const syData = () => read(syKey(), {});

function renderSyllabus() {
  const fac = isFaculty(), subjects = subjectsList(), data = syData();
  $('sy-banner').innerHTML = fac
    ? '📘 <b>Class coverage tracker.</b> Tick topics as you finish teaching them.'
    : '🔒 <b>Private to you.</b> Only you can see this tracker. Faculty cannot.';
  $('sy-import').hidden = fac;
  if (!subjects.some(s => s.code === sySelected)) sySelected = subjects[0] ? subjects[0].code : '';
  $('sy-subject').innerHTML = subjects.map(s => `<option value="${escapeHtml(s.code)}">${escapeHtml(s.code + ' · ' + s.name)}</option>`).join('');
  $('sy-subject').value = sySelected;

  $('sy-summary').innerHTML = subjects.map(s => {
    const list = data[s.code] || [], done = list.filter(t => t.done).length;
    const pct = list.length ? Math.round(done / list.length * 100) : 0;
    return `<div class="sy-card"><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.code)} · ${done}/${list.length} topics</small>
      <div class="bar good"><i style="width:${pct}%"></i></div><small>${pct}%</small></div>`;
  }).join('') || '<p class="muted">Add subjects in the timetable first.</p>';

  const list = data[sySelected] || [];
  $('sy-list').innerHTML = list.length ? list.map(t => `<div class="topic-item${t.done ? ' done' : ''}">
    <label><input type="checkbox" data-sy-toggle="${t.id}" ${t.done ? 'checked' : ''}> <span>${escapeHtml(t.topic)}</span></label>
    <small>${t.done && t.doneOn ? 'Done ' + escapeHtml(friendlyDate(t.doneOn)) : ''}</small>
    <button type="button" class="mini-btn reject" data-sy-del="${t.id}">Delete</button></div>`).join('')
    : '<p class="muted">No topics yet. Add some above.</p>';
}

function syAddTopics(text) {
  if (!sySelected) { toast('Add a subject to the timetable first.'); return; }
  const lines = text.split('\n').map(x => x.trim()).filter(Boolean);
  if (!lines.length) return;
  const data = syData();
  data[sySelected] = [...(data[sySelected] || []), ...lines.map(t => ({ id: uid(), topic: t, done: false, doneOn: '' }))];
  save(syKey(), data);
  renderSyllabus();
  toast(`${lines.length} topic(s) added.`);
}

function syImport() {
  if (isFaculty() || !sySelected) return;
  const source = read('cl_fsyllabus', {})[sySelected] || [];
  const data = syData(), mine = data[sySelected] || [];
  const have = new Set(mine.map(t => t.topic.toLowerCase()));
  const fresh = source.filter(t => !have.has(t.topic.toLowerCase())).map(t => ({ id: uid(), topic: t.topic, done: false, doneOn: '' }));
  if (!fresh.length) { toast('Nothing new to import for this subject.'); return; }
  data[sySelected] = [...mine, ...fresh];
  save(syKey(), data);
  renderSyllabus();
  toast(`${fresh.length} topic(s) imported.`);
}

/* =====================  TO-DO LIST  ===================== */
let tdFilter = 'all';
const tdKey = () => 'cl_todos_' + username;
const tdItems = () => read(tdKey());

function renderTodo() {
  const items = tdItems();
  const active = items.filter(t => !t.done).length;
  document.querySelectorAll('[data-td-filter]').forEach(b => b.classList.toggle('on', b.dataset.tdFilter === tdFilter));
  $('td-count').textContent = `${active} to do · ${items.length - active} done`;
  const shown = items.filter(t => tdFilter === 'all' || (tdFilter === 'done' ? t.done : !t.done))
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.due || '9999').localeCompare(b.due || '9999') || a.createdAt.localeCompare(b.createdAt));
  $('td-list').innerHTML = shown.length ? shown.map(t => {
    const over = t.due && !t.done && t.due < todayStr();
    return `<div class="topic-item${t.done ? ' done' : ''}"><label><input type="checkbox" data-td-toggle="${t.id}" ${t.done ? 'checked' : ''}> <span>${escapeHtml(t.text)}</span></label>
      <small class="${over ? 'overdue' : ''}">${t.due ? (over ? 'Overdue · ' : 'Due ') + escapeHtml(friendlyDate(t.due)) : ''}</small>
      <button type="button" class="mini-btn reject" data-td-del="${t.id}">Delete</button></div>`;
  }).join('') : '<p class="muted">Nothing here. Add a task above.</p>';
}

/* =====================  SUBMISSION DEADLINES  ===================== */
const getDeadlines = () => read('cl_deadlines');
const getSubmitted = () => read('cl_submitted', {});

function renderDeadlines() {
  const fac = isFaculty();
  $('dl-form').hidden = !fac;
  const subs = subjectsList();
  const sel = $('dl-subject'), prev = sel.value;
  sel.innerHTML = '<option value="">General</option>' + subs.map(s => `<option value="${escapeHtml(s.code)}">${escapeHtml(s.code + ' · ' + s.name)}</option>`).join('');
  sel.value = prev;
  const submitted = getSubmitted();
  const list = getDeadlines().slice().sort((a, b) => {
    const as = (submitted[a.id] || []).includes(username), bs = (submitted[b.id] || []).includes(username);
    return (!fac ? Number(as) - Number(bs) : 0) || a.due.localeCompare(b.due);
  });
  $('dl-list').innerHTML = list.length ? list.map(d => {
    const who = submitted[d.id] || [], mine = who.includes(username), left = daysLeft(d.due);
    let chip = `<span class="tag tag-good">${left} days left</span>`;
    if (mine && !fac) chip = '<span class="tag tag-good">Submitted ✓</span>';
    else if (left < 0) chip = `<span class="tag tag-bad">Overdue by ${-left} day(s)</span>`;
    else if (left === 0) chip = '<span class="tag tag-bad">Due today</span>';
    else if (left <= 2) chip = `<span class="tag tag-warn">${left} day(s) left</span>`;
    const action = fac
      ? `<small>${who.length} of ${STUDENT_LOGINS.length} students marked submitted</small><button type="button" class="mini-btn reject" data-dl-del="${d.id}">Delete</button>`
      : `<button type="button" class="btn ${mine ? 'btn-outline' : 'btn-primary'} small-btn" data-dl-submit="${d.id}">${mine ? 'Undo' : 'Mark submitted'}</button>`;
    return `<div class="deadline-card"><div><strong>${escapeHtml(d.title)}</strong>
      <small>${d.code ? escapeHtml(d.code) + ' · ' : ''}Due ${escapeHtml(friendlyDate(d.due))}${d.notes ? ' · ' + escapeHtml(d.notes) : ''}</small><div>${chip}</div></div>
      <div class="deadline-actions">${action}</div></div>`;
  }).join('') : '<p class="muted">No deadlines posted yet.</p>';
}

/* =====================  GLANCE & BADGES  ===================== */
function renderGlance() {
  if (!username) return;
  const today = todayStr(), fac = isFaculty();
  const slots = getTimetable().filter(s => s.day === dayOf(today));
  const subs = getSubmitted(), upcoming = getDeadlines().filter(d => d.due >= today);
  const openTodos = tdItems().filter(t => !t.done).length;
  const card = (num, label, go) => `<button type="button" class="glance-item" data-glance="${go}"><b>${num}</b><small>${label}</small></button>`;
  let html;
  if (fac) {
    html = card(slots.length, 'lectures today', 'register') + card(upcoming.length, 'upcoming deadlines posted', 'deadlines') + card(openTodos, 'open to-do tasks', 'todo');
  } else {
    const st = attendanceStats(username), p = predictor(st.A, st.T);
    const logged = getAttendance().filter(r => r.student === username && r.date === today).length;
    const due = upcoming.filter(d => !(subs[d.id] || []).includes(username) && daysLeft(d.due) <= 3).length;
    html = card(`${logged}/${slots.length}`, 'lectures logged today', 'attendance')
      + card(p.pct === null ? '—' : Math.round(p.pct) + '%', 'attendance (need 75%)', 'attendance')
      + card(due, 'deadlines due in 3 days', 'deadlines') + card(openTodos, 'open to-do tasks', 'todo');
  }
  $('glance-items').innerHTML = html;
  $('glance-date').textContent = friendlyDate(today).toUpperCase();
}

function updateBadges() {
  const open = tdItems().filter(t => !t.done).length;
  const subs = getSubmitted();
  const due = getDeadlines().filter(d => daysLeft(d.due) >= 0 && daysLeft(d.due) <= 3 && (isFaculty() || !(subs[d.id] || []).includes(username))).length;
  [['nav-todo-count', open], ['nav-dl-count', due]].forEach(([id, n]) => { $(id).textContent = n; $(id).hidden = n === 0; });
}

document.addEventListener('click', e => {
  const g = e.target.closest('[data-glance]');
  if (g) showSection(g.dataset.glance);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('announcement-modal').hidden) $('close-announcements').click();
});
$('toggle-pass').addEventListener('click', () => {
  const show = $('password').type === 'password';
  $('password').type = show ? 'text' : 'password';
  $('toggle-pass').textContent = show ? 'Hide password' : 'Show password';
});

/* =====================  POINTS BY CATEGORY + PDF TRANSCRIPT  ===================== */
const CAT_COLORS = ['#6c55e8', '#ff936b', '#4cc49a', '#4c9cf6', '#ff80b5', '#ffd95b', '#8976ff'];
function catOf(r) {
  const ev = events().find(x => x.id === r.eventId);
  return r.category || (ev && ev.category) || 'General';
}
function pointsByCategory() {
  const totals = {};
  myRecords().filter(r => r.status === 'Approved').forEach(r => { const c = catOf(r); totals[c] = (totals[c] || 0) + Number(r.points || 0); });
  return Object.entries(totals).filter(([, v]) => v > 0);
}

function renderPointsChart() {
  const wrap = $('pts-charts');
  if (!wrap) return;
  wrap.hidden = isFaculty();
  if (isFaculty()) return;
  const data = pointsByCategory(), total = data.reduce((s, [, v]) => s + v, 0);
  if (!total) { $('pts-chart').innerHTML = '<p class="muted">No approved points yet. They appear here once faculty approves your activities.</p>'; return; }
  const R = 70, C = 2 * Math.PI * R;
  let offset = 0;
  const arcs = data.map(([c, v], i) => {
    const len = v / total * C;
    const arc = `<circle cx="90" cy="90" r="${R}" fill="none" stroke="${CAT_COLORS[i % CAT_COLORS.length]}" stroke-width="26" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"><title>${escapeHtml(c)}: ${v}</title></circle>`;
    offset += len;
    return arc;
  }).join('');
  const legend = data.map(([c, v], i) => `<li><i style="background:${CAT_COLORS[i % CAT_COLORS.length]}"></i>${escapeHtml(c)} <b>${v}</b></li>`).join('');
  $('pts-chart').innerHTML = `<div class="donut-wrap"><svg viewBox="0 0 180 180" class="donut" role="img" aria-label="Approved points by category"><g transform="rotate(-90 90 90)">${arcs}</g><text x="90" y="92" text-anchor="middle" class="donut-num">${total}</text><text x="90" y="108" text-anchor="middle" class="donut-sub">of 100 points</text></svg><ul class="donut-legend">${legend}</ul></div>`;
}

function generateTranscript() {
  try { buildTranscript(); }
  catch (err) { console.error(err); toast('Could not create the PDF: ' + (err && err.message ? err.message : err)); }
}

function buildTranscript() {
  if (!window.jspdf) { toast('The PDF library did not load. Check your internet connection and try again.'); return; }
  const doc = new window.jspdf.jsPDF(), mine = myRecords(), approved = approvedPoints(mine);
  const head = { fillColor: [108, 85, 232] };
  const acc = ACCOUNTS[username];
  doc.setFontSize(20); doc.text('AICTE Activity Transcript', 14, 20);
  doc.setFontSize(11);
  doc.text(`Student: ${displayName(username)} (${acc?.roll || username.toUpperCase()}) · Division: ${acc?.div || currentDivision()}`, 14, 30);
  doc.text('Generated: ' + new Date().toLocaleDateString('en-IN'), 14, 36);
  doc.text(`Approved points: ${approved} / 100 (${Math.max(100 - approved, 0)} remaining)`, 14, 42);
  doc.autoTable({
    startY: 50, headStyles: head, head: [['Activity', 'Category', 'Date', 'Hours', 'Points', 'Status']],
    body: mine.length ? mine.map(r => [r.event, catOf(r), r.date || '-', Number(r.duration) || 0, Number(r.points) || 0, r.status]) : [['No records yet', '', '', '', '', '']]
  });
  let y = doc.lastAutoTable.finalY + 10;
  const cats = pointsByCategory();
  if (cats.length) {
    doc.autoTable({ startY: y, headStyles: head, tableWidth: 90, head: [['Category', 'Approved points']], body: cats.map(([c, v]) => [c, v]) });
    y = doc.lastAutoTable.finalY + 10;
  }
  const st = attendanceStats(username), p = predictor(st.A, st.T);
  if (st.T) {
    doc.autoTable({
      startY: y, headStyles: head, head: [['Subject', 'Attended', 'Held', 'Percent']],
      body: st.list.filter(s => s.T).map(s => [s.code + ' ' + s.name, s.A, s.T, Math.round(s.A / s.T * 100) + '%']).concat([['Overall', st.A, st.T, Math.round(p.pct) + '%']])
    });
  }
  try { doc.save('AICTE-Transcript-' + username + '.pdf'); toast('Transcript downloaded.'); }
  catch (e) { window.open(doc.output('bloburl'), '_blank'); }
}
$('pdf-btn').addEventListener('click', generateTranscript);

/* =====================  WHAT-IF, CALENDAR, DEFAULTERS, CSV, CLASS LIST  ===================== */
const byRoll = (a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true });
const slugOf = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function renderWhatIf(st) {
  const sk = Math.max(0, parseInt($('wi-skip').value, 10) || 0), at = Math.max(0, parseInt($('wi-attend').value, 10) || 0);
  const A = st.A + at, T = st.T + sk + at;
  if (!T) { $('wi-result').textContent = 'Log some lectures first, then try a what-if.'; return; }
  const p = predictor(A, T), below = 100 * A < PASS_PERCENT * T;
  $('wi-result').innerHTML = `After skipping <b>${sk}</b> and attending <b>${at}</b>, your attendance would be <b>${p.pct.toFixed(1)}%</b> `
    + (below ? `(<b>below</b> ${PASS_PERCENT}%). You would then need to attend <b>${p.need}</b> lecture(s) in a row to recover.`
             : `(at or above ${PASS_PERCENT}%). You could still skip <b>${p.skip}</b> more after that.`);
}
['wi-skip', 'wi-attend'].forEach(id => $(id).addEventListener('input', () => { if (!isFaculty()) renderWhatIf(attendanceStats(username)); }));

let calMonth = todayStr().slice(0, 7);
function renderCalendar() {
  const [y, m] = calMonth.split('-').map(Number), first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate();
  $('cal-title').textContent = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const slots = getTimetable(), byDate = {};
  getAttendance().filter(r => r.student === username && r.date.startsWith(calMonth)).forEach(r => {
    const sl = slots.find(s => s.id === r.slotId);
    if (!sl || r.status === 'Cancelled' || effectiveLecture(sl, r.date).cancelled) return;
    const d = byDate[r.date] = byDate[r.date] || { A: 0, B: 0 };
    if (r.status === 'Attended' || r.status === 'OD') d.A++; else d.B++;
  });
  let html = DAY_NAMES.map(d => `<b class="cal-h">${d}</b>`).join('') + '<i></i>'.repeat(first.getDay());
  for (let d = 1; d <= days; d++) {
    const ds = `${calMonth}-${String(d).padStart(2, '0')}`, v = byDate[ds];
    html += `<span class="cal-day ${!v ? 'n' : v.B ? 'r' : 'g'}${ds === todayStr() ? ' today' : ''}" title="${v ? v.A + ' attended, ' + v.B + ' missed' : 'No data'}">${d}</span>`;
  }
  $('cal-grid').innerHTML = html;
}
function shiftMonth(n) { const [y, m] = calMonth.split('-').map(Number), d = new Date(y, m - 1 + n, 1); calMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); renderCalendar(); }
$('cal-prev').addEventListener('click', () => shiftMonth(-1));
$('cal-next').addEventListener('click', () => shiftMonth(1));

function renderDefaulters() {
  const rows = getRoster().map(s => { const st = attendanceStats(s.id), p = predictor(st.A, st.T); return { ...s, A: st.A, T: st.T, pct: p.pct, need: p.need, below: st.T > 0 && 100 * st.A < PASS_PERCENT * st.T }; })
    .filter(r => r.below).sort((a, b) => a.pct - b.pct);
  $('rg-defaulters').innerHTML = rows.length
    ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>ROLL</th><th>STUDENT</th><th>ATTENDED / HELD</th><th>PERCENT</th><th>MUST ATTEND</th></tr></thead><tbody>`
      + rows.map(r => `<tr><td>${escapeHtml(r.roll)}</td><td><strong>${escapeHtml(r.name)}</strong></td><td>${r.A} / ${r.T}</td><td><span class="tag tag-bad">${r.pct.toFixed(1)}%</span></td><td>${r.need} in a row</td></tr>`).join('') + '</tbody></table></div>'
    : `<p class="muted">No students in ${currentDivision()} are below 75% right now.</p>`;
}

function downloadCsv(name, rows) {
  const cell = v => { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
$('rg-export').addEventListener('click', () => {
  const date = $('rg-date').value, slot = getTimetable().find(s => s.id === $('rg-slot').value);
  if (!slot) { toast('Choose a lecture first.'); return; }
  downloadCsv(`attendance-${currentDivision()}-${slot.code}-${date}.csv`, [['Division', 'Date', 'Lecture', 'Roll no', 'Student', 'Status']]
    .concat(getRoster().map(s => [currentDivision(), date, slot.code + ' ' + slot.subject, s.roll, s.name, rgState[s.id] === 'A' ? 'Absent' : rgState[s.id] === 'OD' ? 'OD' : 'Present'])));
});

document.addEventListener('click', e => {
  if (!isFaculty()) return;
  const aud = e.target.closest('[data-rg-audit]'), rm = e.target.closest('[data-rg-remove]');
  const allRoster = getAllRoster();
  if (aud) {
    const stId = aud.dataset.rgAudit;
    const slotId = $('rg-slot').value;
    const date = $('rg-date').value;
    if (!slotId) { toast('Select a lecture slot first.'); return; }
    $('audit-student-id').value = stId;
    $('audit-slot-id').value = slotId;
    $('audit-date').value = date;
    $('audit-student-name').textContent = `${ACCOUNTS[stId]?.roll || stId.toUpperCase()} · ${displayName(stId)}`;
    $('audit-target-date').textContent = friendlyDate(date);
    $('audit-modal').hidden = false;
  }
  if (rm) {
    const id = rm.dataset.rgRemove;
    if (STUDENT_LOGINS.includes(id)) { toast('Core division student accounts (A-01..D-10) have login credentials and cannot be removed.'); return; }
    if (!confirm('Remove this student from the register?')) return;
    save('cl_roster_v2', allRoster.filter(x => x.id !== id)); delete rgState[id]; renderRegister(); toast('Student removed.');
  }
});

$('rg-paste-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!isFaculty()) return;
  const allRoster = getAllRoster(), div = currentDivision();
  let added = 0, skipped = 0;
  $('rg-paste').value.split('\n').forEach(line => {
    if (!line.trim()) return;
    const m = line.trim().match(/^(\S+?)[\s,;]+(.+)$/);
    if (!m || allRoster.some(s => s.roll.toLowerCase() === m[1].toLowerCase())) { skipped++; return; }
    let id = m[1].toLowerCase();
    if (allRoster.some(s => s.id === id)) id = slugOf(m[2]) + '-' + m[1].toLowerCase();
    allRoster.push({ id, roll: m[1].toUpperCase(), name: m[2].trim(), div }); added++;
  });
  save('cl_roster_v2', allRoster.sort(byRoll));
  $('rg-paste').value = '';
  rgReload();
  toast(`${added} student(s) added to ${div}, ${skipped} line(s) skipped.`);
});

/* =====================  FACULTY VIEW & DASHBOARD  ===================== */
function applyRoleLayout() {
  const fac = username === 'faculty';
  document.querySelectorAll('.student-only').forEach(el => { el.hidden = fac; });
  document.querySelectorAll('.faculty-only').forEach(el => { el.hidden = !fac; });
  const grid = document.querySelector('#overview-section > .stats-grid');
  if (grid) grid.style.gridTemplateColumns = fac ? 'repeat(2,minmax(0,1fr))' : '';
  const lower = document.querySelector('#overview-section .lower-grid');
  if (lower) lower.style.gridTemplateColumns = fac ? '1fr' : '';
  $('act-eyebrow').textContent = fac ? 'ACTIVITY DETAILS' : 'GET INVOLVED';
  $('act-title').textContent = fac ? 'Activities you have added 📋' : 'Find your next thing ✨';
  $('act-sub').textContent = fac ? 'Details and check-in numbers for every activity you publish.' : 'Pick an activity, show up, and let your participation count.';
}
function renderActivityInfo() {
  const list = events(), recs = records();
  $('all-activities').innerHTML = list.length ? list.map(e => {
    const mine = recs.filter(r => r.eventId === e.id), n = s => mine.filter(r => r.status === s).length;
    return `<article class="act-info"><h4>${escapeHtml(e.name)}</h4><p>${escapeHtml(e.description || 'No description added.')}</p>
      <dl class="act-facts"><div><dt>CATEGORY</dt><dd>${escapeHtml(e.category || 'General')}</dd></div><div><dt>DATE</dt><dd>${escapeHtml(friendlyDate(e.date))}</dd></div>
      <div><dt>DURATION</dt><dd>${Number(e.duration) || 0} hour(s)</dd></div><div><dt>VENUE</dt><dd>${escapeHtml(e.venue || '')}</dd></div>
      <div><dt>ALLOWED RADIUS</dt><dd>${Number(e.radius) || 0} m</dd></div><div><dt>EVENT CODE</dt><dd>${escapeHtml(e.qr || '')}</dd></div></dl>
      <div class="act-counts"><span class="tag tag-good">${n('Approved')} approved</span><span class="tag tag-warn">${n('Pending')} pending</span><span class="tag tag-bad">${n('Rejected')} rejected</span></div></article>`;
  }).join('') : '<p class="muted">You have not added any activities yet. Use Manage events to publish one.</p>';
  $('activity-total').textContent = list.length + (list.length === 1 ? ' activity' : ' activities');
}

function classStats() {
  return getRoster().map(s => {
    const st = attendanceStats(s.id), p = predictor(st.A, st.T);
    return { ...s, st, pct: p.pct, need: p.need, below: st.T > 0 && 100 * st.A < PASS_PERCENT * st.T };
  });
}

const barRow = (label, title, pct, cls, text, marker) => `<div class="hbar"><span class="hbar-label">${escapeHtml(label)}</span><div class="hbar-track" title="${escapeHtml(title)}"><i class="${cls}" style="width:${pct}%"></i>${marker ? `<u style="left:${PASS_PERCENT}%"></u>` : ''}</div><b>${text}</b></div>`;

function renderFacDash() {
  const today = todayStr(), rows = classStats(), below = rows.filter(r => r.below), withData = rows.filter(r => r.pct !== null);
  const avg = withData.length ? withData.reduce((s, r) => s + r.pct, 0) / withData.length : null;
  const slots = sortedSlots(getTimetable()).filter(s => s.day === dayOf(today)), att = getAttendance();
  const state = s => effectiveLecture(s, today).cancelled ? 'cancelled' : att.some(r => r.date === today && r.slotId === s.id && r.markedBy === 'Faculty') ? 'saved' : 'open';
  const dueWeek = getDeadlines().filter(d => daysLeft(d.due) >= 0 && daysLeft(d.due) <= 6).length;
  const pending = records().filter(r => r.status === 'Pending').length + getOdRequests().filter(o => o.status === 'Pending').length;
  const avgText = avg === null ? '—' : avg.toFixed(0) + '%';

  $('fd-below').textContent = below.length;
  $('fd-today').textContent = slots.length;
  $('fd-deadlines').textContent = dueWeek;
  $('fr-avg').textContent = avgText;

  const items = [];
  slots.filter(s => state(s) === 'open').forEach(s => items.push(['register', `Register for ${s.code} at ${s.start} (${currentDivision()}) not saved yet`]));
  if (pending) items.push(['students', `${pending} request(s) waiting for approval`]);
  if (below.length) items.push(['register', `${below.length} student(s) in ${currentDivision()} below ${PASS_PERCENT}%`]);
  if (dueWeek) items.push(['deadlines', `${dueWeek} deadline(s) due this week`]);
  $('fd-attention').innerHTML = items.length ? items.map(([go, t]) => `<button type="button" class="attn-item" data-glance="${go}"><span>${escapeHtml(t)}</span><span>→</span></button>`).join('') : '<p class="muted">You are all caught up 🎉</p>';

  const tag = { saved: '<span class="tag tag-good">Register saved</span>', open: '<span class="tag tag-warn">Not marked yet</span>', cancelled: '<span class="tag tag-bad">Cancelled</span>' };
  $('fd-today-list').innerHTML = slots.length ? slots.map(s => `<div class="lecture-row"><div class="lecture-info"><strong>${escapeHtml(s.start)}–${escapeHtml(s.end)} · ${escapeHtml(s.subject)}</strong><small>${escapeHtml(s.code)} · ${escapeHtml(currentDivision())}</small><div>${tag[state(s)]}</div></div><button type="button" class="btn btn-outline small-btn" data-take="${s.id}">Open register</button></div>`).join('') : '<p class="muted">No lectures scheduled today.</p>';

  $('fd-class').innerHTML = `<p class="big-stat">${avgText} <small>${escapeHtml(currentDivision())} average</small></p>` + subjectsList().map(sub => {
    let A = 0, T = 0;
    rows.forEach(r => { const x = r.st.list.find(y => y.code === sub.code); if (x) { A += x.A; T += x.T; } });
    const pct = T ? A / T * 100 : 0;
    return barRow(sub.code, sub.name, pct, !T ? 'none' : pct < PASS_PERCENT ? 'bad' : 'good', T ? Math.round(pct) + '%' : '—', true);
  }).join('');

  const syl = read('cl_fsyllabus', {});
  $('fd-syllabus').innerHTML = subjectsList().map(sub => {
    const l = syl[sub.code] || [], d = l.filter(t => t.done).length, p = l.length ? d / l.length * 100 : 0;
    return barRow(sub.code, `${sub.name}: ${d}/${l.length} topics`, p, l.length ? 'good' : 'none', l.length ? Math.round(p) + '%' : '—', false);
  }).join('') || '<p class="muted">Add subjects in the timetable first.</p>';
}

function takeAttendance(slotId) {
  const today = todayStr(), now = new Date().toTimeString().slice(0, 5);
  const slots = sortedSlots(getTimetable()).filter(s => s.day === dayOf(today));
  const id = slotId || (slots.find(s => s.end >= now) || slots[0] || {}).id;
  $('rg-date').value = today;
  showSection('register');
  if (id) { $('rg-slot').value = id; rgReload(); } else toast('No lectures today. Pick a date in the register.');
}

function downloadReport(kind) {
  const rows = classStats(), d = todayStr(), div = currentDivision(), pct = r => r.pct === null ? '' : r.pct.toFixed(1);
  if (kind === 'class') downloadCsv(`class-attendance-${div}-${d}.csv`, [['Division', 'Roll no', 'Student', 'Attended', 'Held', 'Percent', 'Status']]
    .concat(rows.map(r => [div, r.roll, r.name, r.st.A, r.st.T, pct(r), r.st.T ? (r.below ? 'Below 75%' : 'OK') : 'No data'])));
  if (kind === 'defaulters') downloadCsv(`defaulters-${div}-${d}.csv`, [['Division', 'Roll no', 'Student', 'Attended', 'Held', 'Percent', 'Must attend in a row']]
    .concat(rows.filter(r => r.below).map(r => [div, r.roll, r.name, r.st.A, r.st.T, pct(r), r.need])));
  if (kind === 'points') {
    const allRecs = records();
    downloadCsv(`aicte-points-${div}-${d}.csv`, [['Division', 'Roll no', 'Student', 'Approved points', 'Approved activities', 'Pending']]
      .concat(getRoster().map(s => {
        const mine = allRecs.filter(r => r.student === s.id);
        return [div, s.roll, s.name, approvedPoints(mine), mine.filter(r => r.status === 'Approved').length, mine.filter(r => r.status === 'Pending').length];
      })));
  }
}

function renderNotices() {
  const list = read('cl_notices').slice().reverse();
  $('modal-notices').innerHTML = list.length ? '<div class="eyebrow" style="margin-top:12px">NOTICES FROM FACULTY</div>' + list.map(n => `<div class="callout" style="margin:8px 0 0"><strong>📣 ${escapeHtml(n.text)}</strong><br><small>Posted ${escapeHtml(friendlyDate(n.at))}</small></div>`).join('') : '';
  $('fd-notices').innerHTML = list.length ? list.map(n => `<div class="approval-row"><div><strong>${escapeHtml(n.text)}</strong><small>${escapeHtml(friendlyDate(n.at))}</small></div><button type="button" class="mini-btn reject" data-notice-del="${n.id}">Delete</button></div>`).join('') : '<p class="muted">No notices posted yet.</p>';
}
$('notice-form').addEventListener('submit', e => {
  e.preventDefault();
  const text = $('notice-text').value.trim();
  if (!isFaculty() || !text) return;
  save('cl_notices', [...read('cl_notices'), { id: uid(), text, at: todayStr() }]);
  $('notice-text').value = ''; renderNotices(); toast('Notice posted. Students will see it under announcements.');
});

function openProfile(tr) {
  const u = tr.dataset.studentId || STUDENT_LOGINS.find(x => tr.textContent.includes(displayName(x)));
  if (!u) { toast('Student profile not found.'); return; }
  const st = attendanceStats(u), p = predictor(st.A, st.T), recs = records().filter(r => r.student === u), subs = getSubmitted();
  const attRows = st.list.filter(s => s.T).map(s => `<tr><td>${escapeHtml(s.code + ' ' + s.name)}</td><td>${s.A}/${s.T}</td><td>${Math.round(s.A / s.T * 100)}%</td></tr>`).join('');
  const dl = getDeadlines().map(d => `<li>${escapeHtml(d.title)}: ${(subs[d.id] || []).includes(u) ? '✓ submitted' : 'not submitted'}</li>`).join('');
  const acc = ACCOUNTS[u];
  $('profile-body').innerHTML = `<div class="eyebrow">STUDENT PROFILE · ${escapeHtml(acc?.div || currentDivision())}</div><h2>${escapeHtml(displayName(u))} (${escapeHtml(acc?.roll || u.toUpperCase())})</h2>
    <h3>Attendance: ${p.pct === null ? 'no data yet' : p.pct.toFixed(1) + '%'}</h3>${attRows ? `<table class="data-table"><tbody>${attRows}</tbody></table>` : ''}
    <h3>AICTE points: ${approvedPoints(recs)} / 100</h3><p class="muted">${recs.filter(r => r.status === 'Approved').length} approved, ${recs.filter(r => r.status === 'Pending').length} pending</p>
    <h3>Deadlines</h3>${dl ? `<ul>${dl}</ul>` : '<p class="muted">No deadlines posted.</p>'}`;
  $('profile-modal').hidden = false;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('profile-modal').hidden = true; });

document.addEventListener('click', e => {
  const t = e.target, take = t.closest('[data-take]'), rep = t.closest('[data-report]'), nd = t.closest('[data-notice-del]');
  if (take) takeAttendance(take.dataset.take);
  if (t.closest('#fd-take')) takeAttendance();
  if (t.closest('#fd-create')) showSection('manage');
  if (rep) downloadReport(rep.dataset.report);
  if (nd && isFaculty()) { save('cl_notices', read('cl_notices').filter(n => n.id !== nd.dataset.noticeDel)); renderNotices(); }
  if (t.closest('[data-close-profile]') || t.id === 'profile-modal') $('profile-modal').hidden = true;
  const tr = t.closest('#student-records tr');
  if (tr && isFaculty()) openProfile(tr);
});

/* =====================  COMBINED CALENDAR  ===================== */
let ccMonth = todayStr().slice(0, 7), ccDay = todayStr();
function ccItems(ds) {
  return {
    lec: getTimetable().filter(s => s.day === dayOf(ds)).sort((a, b) => a.start.localeCompare(b.start)).map(s => ({ s, eff: effectiveLecture(s, ds) })),
    dl: getDeadlines().filter(d => d.due === ds),
    ev: events().filter(e => e.date === ds)
  };
}
function renderCombinedCal() {
  const [y, m] = ccMonth.split('-').map(Number), first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate();
  $('cc-title').textContent = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  let h = DAY_NAMES.map(d => `<b class="cal-h">${d}</b>`).join('') + '<i></i>'.repeat(first.getDay());
  for (let d = 1; d <= days; d++) {
    const ds = `${ccMonth}-${String(d).padStart(2, '0')}`, it = ccItems(ds);
    h += `<button type="button" class="cal-day${ds === todayStr() ? ' today' : ''}${ds === ccDay ? ' sel' : ''}" data-cc="${ds}">${d}<em class="dots">${it.lec.length ? '<i class="dl"></i>' : ''}${it.dl.length ? '<i class="dd"></i>' : ''}${it.ev.length ? '<i class="de"></i>' : ''}</em></button>`;
  }
  $('cc-grid').innerHTML = h;
  const it = ccItems(ccDay), e = escapeHtml;
  $('cc-day-title').textContent = friendlyDate(ccDay);
  $('cc-day').innerHTML = [
    ...it.lec.map(({ s, eff }) => `<div class="cc-row"><span><strong>${e(eff.subject)}</strong> <small>${e(s.start)}–${e(s.end)} · ${e(eff.prof)}</small></span>${eff.cancelled ? '<span class="tag tag-bad">Cancelled</span>' : eff.substitute ? '<span class="tag tag-warn">Substitute</span>' : '<span class="tag tag-good">Lecture</span>'}</div>`),
    ...it.dl.map(d => `<div class="cc-row"><span><strong>${e(d.title)}</strong> <small>${e(d.code || 'General')}</small></span><span class="tag tag-bad">Deadline</span></div>`),
    ...it.ev.map(ev => `<div class="cc-row"><span><strong>${e(ev.name)}</strong> <small>${e(ev.venue || '')}</small></span><span class="tag tag-good">Event</span></div>`)
  ].join('') || '<p class="muted">Nothing scheduled on this day.</p>';
}
function shiftCcMonth(n) {
  const [y, m] = ccMonth.split('-').map(Number), d = new Date(y, m - 1 + n, 1);
  ccMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  renderCombinedCal();
}
$('cc-prev').addEventListener('click', () => shiftCcMonth(-1));
$('cc-next').addEventListener('click', () => shiftCcMonth(1));
document.addEventListener('click', e => { const c = e.target.closest('[data-cc]'); if (c) { ccDay = c.dataset.cc; renderCombinedCal(); } });

/* =====================  THEME (light / dark)  ===================== */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $('theme-toggle').textContent = t === 'dark' ? '☀️' : '🌙';
  $('theme-toggle').setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  try { localStorage.setItem('cl_theme', t); } catch (e) {}
}
$('theme-toggle').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
applyTheme(localStorage.getItem('cl_theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

/* =====================  RENDER HOOK + EVENTS  ===================== */
function renderAcademic(section) {
  if (!username) return;
  renderAttendance();
  renderTimetable();
  renderMarks();
  renderSyllabus();
  renderTodo();
  renderDeadlines();
  if (isFaculty()) {
    if (section === 'register') rgPrepare(); else renderRegister();
  }
  renderGlance();
  updateBadges();
  renderPointsChart();
  renderNotices();
  renderCombinedCal();
  if (isFaculty()) { renderActivityInfo(); renderFacDash(); }
}

document.addEventListener('click', e => {
  const t = e.target;
  const ac = t.closest('[data-ac-slot]');
  if (ac && !ac.disabled) acSetStatus(ac.dataset.acSlot, ac.dataset.acStatus);

  const delSlot = t.closest('[data-del-slot]');
  if (delSlot && isFaculty()) {
    if (!confirm(`Remove this lecture from ${currentDivision()} timetable?`)) return;
    const id = delSlot.dataset.delSlot;
    save(ttKey(), getTimetable().filter(s => s.id !== id));
    save(chgKey(), getChanges().filter(c => c.slotId !== id));
    if (ttEditingId === id) resetTimetableForm();
    renderAcademic();
    toast(`Lecture removed from ${currentDivision()}.`);
  }

  const delChange = t.closest('[data-del-change]');
  if (delChange && isFaculty()) {
    save(chgKey(), getChanges().filter(c => c.id !== delChange.dataset.delChange));
    renderAcademic();
    toast(`Update removed from ${currentDivision()}.`);
  }

  const rg = t.closest('[data-rg-toggle]');
  if (rg && isFaculty()) {
    const id = rg.dataset.rgToggle;
    rgState[id] = rgState[id] === 'P' ? 'A' : rgState[id] === 'A' ? 'OD' : 'P';
    renderRegister();
  }

  const syT = t.closest('[data-sy-toggle]');
  if (syT) {
    const data = syData();
    const item = (data[sySelected] || []).find(x => x.id === syT.dataset.syToggle);
    if (item) { item.done = !item.done; item.doneOn = item.done ? todayStr() : ''; save(syKey(), data); renderSyllabus(); }
  }
  const syD = t.closest('[data-sy-del]');
  if (syD) {
    const data = syData();
    data[sySelected] = (data[sySelected] || []).filter(x => x.id !== syD.dataset.syDel);
    save(syKey(), data); renderSyllabus();
  }

  const tdT = t.closest('[data-td-toggle]');
  if (tdT) { save(tdKey(), tdItems().map(x => x.id === tdT.dataset.tdToggle ? { ...x, done: !x.done } : x)); renderTodo(); }
  const tdD = t.closest('[data-td-del]');
  if (tdD) { save(tdKey(), tdItems().filter(x => x.id !== tdD.dataset.tdDel)); renderTodo(); }
  const tdF = t.closest('[data-td-filter]');
  if (tdF) { tdFilter = tdF.dataset.tdFilter; renderTodo(); }

  const dlD = t.closest('[data-dl-del]');
  if (dlD && isFaculty()) {
    if (!confirm('Delete this deadline?')) return;
    save('cl_deadlines', getDeadlines().filter(x => x.id !== dlD.dataset.dlDel));
    renderDeadlines(); toast('Deadline deleted.');
  }
  const dlS = t.closest('[data-dl-submit]');
  if (dlS && !isFaculty()) {
    const all = getSubmitted(), id = dlS.dataset.dlSubmit, who = all[id] || [];
    all[id] = who.includes(username) ? who.filter(x => x !== username) : [...who, username];
    save('cl_submitted', all); renderDeadlines();
  }
});

$('ac-date').addEventListener('change', renderLectureLog);

document.addEventListener('click', e => {
  const editSlot = e.target.closest('[data-edit-slot]');
  if (editSlot && isFaculty()) {
    const id = editSlot.dataset.editSlot;
    const slot = getTimetable().find(s => s.id === id);
    if (!slot) return;

    ttEditingId = id;
    $('tt-day').value = slot.day;
    $('tt-start').value = slot.start;
    $('tt-end').value = slot.end;
    $('tt-code').value = slot.code;
    $('tt-subject').value = slot.subject;
    $('tt-prof').value = slot.prof;
    $('tt-room').value = slot.room || '';

    const submitBtn = $('tt-form')?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = '💾 Update lecture';
    const cancelBtn = $('tt-cancel-edit');
    if (cancelBtn) cancelBtn.hidden = false;

    $('tt-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    renderTimetable();
    toast(`Editing ${slot.code} (${slot.day} ${slot.start}) — save changes above.`);
  }
});

$('tt-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!isFaculty()) { toast('Only faculty can change the timetable.'); return; }
  const div = currentDivision();
  const slot = {
    id: ttEditingId || uid(),
    day: $('tt-day').value,
    start: $('tt-start').value,
    end: $('tt-end').value,
    code: $('tt-code').value.trim().toUpperCase(),
    subject: $('tt-subject').value.trim(),
    prof: $('tt-prof').value.trim(),
    room: $('tt-room').value.trim()
  };
  if (!slot.start || !slot.end || !slot.code || !slot.subject || !slot.prof) {
    toast('Fill in time, subject code, subject and professor.');
    return;
  }
  if (slot.end <= slot.start) {
    toast('End time must be after the start time.');
    return;
  }
  const existing = getTimetable(div);
  if (existing.some(s => s.id !== ttEditingId && s.day === slot.day && s.start < slot.end && slot.start < s.end)) {
    toast(`That time overlaps another lecture in ${div} on the same day.`);
    return;
  }

  if (ttEditingId) {
    save(ttKey(div), existing.map(s => s.id === ttEditingId ? slot : s));
    toast(`Lecture updated in ${div} timetable.`);
  } else {
    save(ttKey(div), [...existing, slot]);
    toast(`Lecture added to ${div} timetable.`);
  }

  resetTimetableForm();
  renderAcademic();
});

$('chg-date').addEventListener('change', chgFillSlots);
$('chg-type').addEventListener('change', () => {
  const sub = $('chg-type').value === 'substitute';
  $('chg-sub-fields').hidden = !sub;
});
$('chg-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!isFaculty()) { toast('Only faculty can change the timetable.'); return; }
  const div = currentDivision();
  const date = $('chg-date').value, slotId = $('chg-slot').value, type = $('chg-type').value;
  if (!date || !slotId) { toast('Choose a date and a lecture.'); return; }
  const item = { id: uid(), date, slotId, type, subProf: '', countCode: '', note: $('chg-note').value.trim() };
  if (type === 'substitute') {
    item.subProf = $('chg-prof').value.trim();
    item.countCode = $('chg-count').value;
    if (!item.subProf) { toast('Enter the name of the teacher taking the class.'); return; }
  }
  save(chgKey(div), [...getChanges(div).filter(c => !(c.date === date && c.slotId === slotId)), item]);
  $('chg-prof').value = ''; $('chg-note').value = '';
  renderAcademic();
  toast(type === 'cancelled' ? `Lecture marked as cancelled for ${div}.` : `Substitution saved for ${div}.`);
});
$('rg-date').addEventListener('change', rgPrepare);
$('rg-slot').addEventListener('change', rgReload);
$('rg-all-present').addEventListener('click', () => { Object.keys(rgState).forEach(id => rgState[id] = 'P'); renderRegister(); });
$('rg-all-absent').addEventListener('click', () => { Object.keys(rgState).forEach(id => rgState[id] = 'A'); renderRegister(); });
$('rg-save').addEventListener('click', rgSave);
$('rg-add-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!isFaculty()) return;
  const roll = $('rg-roll').value.trim().toUpperCase(), name = $('rg-name').value.trim(), div = currentDivision();
  if (!roll || !name) return;
  const allRoster = getAllRoster();
  if (allRoster.some(s => s.roll.toUpperCase() === roll)) { toast('That roll number already exists.'); return; }
  let id = roll.toLowerCase();
  if (allRoster.some(s => s.id === id)) id = slugOf(name) + '-' + roll.toLowerCase();
  allRoster.push({ id, roll, name, div });
  allRoster.sort(byRoll);
  save('cl_roster_v2', allRoster);
  e.target.reset();
  rgState[id] = 'P';
  renderRegister();
  toast(`Student added to ${div} register.`);
});

$('sy-subject').addEventListener('change', () => { sySelected = $('sy-subject').value; renderSyllabus(); });
$('sy-form').addEventListener('submit', e => { e.preventDefault(); syAddTopics($('sy-topic').value); $('sy-topic').value = ''; });
$('sy-import').addEventListener('click', syImport);

$('td-form').addEventListener('submit', e => {
  e.preventDefault();
  const text = $('td-text').value.trim();
  if (!text) return;
  save(tdKey(), [...tdItems(), { id: uid(), text, due: $('td-due').value, done: false, createdAt: new Date().toISOString() }]);
  $('td-text').value = ''; $('td-due').value = '';
  renderTodo();
});
$('td-clear').addEventListener('click', () => { save(tdKey(), tdItems().filter(t => !t.done)); renderTodo(); toast('Completed tasks cleared.'); });

$('dl-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!isFaculty()) return;
  const title = $('dl-title').value.trim(), due = $('dl-due').value;
  if (!title || !due) { toast('Enter a title and a due date.'); return; }
  save('cl_deadlines', [...getDeadlines(), { id: uid(), title, code: $('dl-subject').value, due, notes: $('dl-notes').value.trim() }]);
  e.target.reset();
  renderDeadlines();
  toast('Deadline posted. Students can see it now.');
});
/* =====================================================================
   PRACTICAL & FA MARKS SPREADSHEET MODULE (WITH DOP, DOC & MARKS)
   ===================================================================== */
const EXPT_COUNT = 10;

// Build flat column list: for each EXPT 1..10 -> dop, doc, mks + FA1, FA2
const MK_COLS = [];
const MK_CSV_HEADERS = [];
for (let i = 1; i <= EXPT_COUNT; i++) {
  MK_COLS.push(
    { key: `expt${i}_dop`, type: 'date', label: `EXPT ${i} DOP` },
    { key: `expt${i}_doc`, type: 'date', label: `EXPT ${i} DOC` },
    { key: `expt${i}`,     type: 'marks', label: `EXPT ${i} MKS` }
  );
  MK_CSV_HEADERS.push(`EXPT ${i} DOP`, `EXPT ${i} DOC`, `EXPT ${i} MARKS`);
}
MK_COLS.push(
  { key: 'fa1', type: 'marks', label: 'FA 1' },
  { key: 'fa2', type: 'marks', label: 'FA 2' }
);
MK_CSV_HEADERS.push('FA 1', 'FA 2');

const MARK_ONLY_KEYS = [
  ...Array.from({ length: EXPT_COUNT }, (_, i) => `expt${i + 1}`),
  'fa1', 'fa2'
];

let mkSelectedSubject = '';

const mkKey = (div = currentDivision(), subCode = mkSelectedSubject) =>
  `cl_marks_dopdoc_${div}_${subCode}`;

function buildMarksThead(firstColLabel, includeRno) {
  const rnoTh = includeRno ? '<th rowspan="2" class="mk-col-rno">R. No</th>' : '';
  let topRow = `<tr>${rnoTh}<th rowspan="2" class="mk-col-name">${firstColLabel}</th>`;
  let subRow = '<tr class="mk-subhead">';
  for (let i = 1; i <= EXPT_COUNT; i++) {
    topRow += `<th colspan="3">EXPT ${i}</th>`;
    subRow += '<th>DOP</th><th>DOC</th><th>MKS</th>';
  }
  topRow += '<th rowspan="2">FA 1</th><th rowspan="2">FA 2</th><th rowspan="2" class="mk-col-avg">AVG</th></tr>';
  subRow += '</tr>';
  return topRow + subRow;
}

function getMarksData(div = currentDivision(), subCode = mkSelectedSubject) {
  if (!subCode) return {};
  const key = mkKey(div, subCode);
  let data = read(key, null);
  if (data && typeof data === 'object' && !Array.isArray(data)) return data;

  data = {};
  const roster = (typeof getAllRoster === 'function' ? getAllRoster() : getRoster()).filter(s => (s.div || 'CSE-A') === div);
  const sampleMarks = [
    ['80','75','75','82','80','70','75','70','75','75','0','75'],
    ['90','88','89','71','82','82','82','75','78','78','80','70'],
    ['90','90','80','88','89','87','82','82','88','82','82','83'],
    ['70','72','77','90','80','70','75','75','80','70','60','50'],
    ['86','75','85','83','78','80','86','70','80','80','0','83'],
    ['','','','','','','','','','','',''],
    ['85','82','85','84','82','86','77','83','82','65','70','AB'],
    ['90','80','80','80','82','82','85','82','86','88','80','80'],
    ['88','88','89','95','86','85','85','90','85','90','75','70'],
    ['90','85','80','80','83','86','85','80','85','90','85','90']
  ];
  const sampleDop = ['15/07','22/07','29/07','05/08','12/08','19/08','26/08','02/09','09/09','16/09'];
  const sampleDoc = ['22/07','29/07','05/08','12/08','19/08','26/08','02/09','09/09','16/09','23/09'];

  roster.forEach((st, idx) => {
    const mRow = sampleMarks[idx % sampleMarks.length];
    const obj = {};
    for (let i = 1; i <= EXPT_COUNT; i++) {
      const mVal = mRow[i - 1] ?? '';
      obj[`expt${i}_dop`] = mVal !== '' ? sampleDop[i - 1] : '';
      obj[`expt${i}_doc`] = mVal !== '' ? sampleDoc[i - 1] : '';
      obj[`expt${i}`] = mVal;
    }
    obj.fa1 = mRow[10] ?? '';
    obj.fa2 = mRow[11] ?? '';
    data[st.id] = obj;
  });
  save(key, data);
  return data;
}

function calcRowAvg(rowObj = {}) {
  let sum = 0, count = 0;
  MARK_ONLY_KEYS.forEach(c => {
    const raw = String(rowObj[c] ?? '').trim();
    if (!raw) return;
    if (/^(ab|absent)$/i.test(raw)) {
      count++;
      return;
    }
    const num = Number(raw);
    if (Number.isFinite(num)) {
      sum += num;
      count++;
    }
  });
  return count ? (sum / count).toFixed(1) : '—';
}

function isAbsentVal(val) {
  return /^(ab|absent)$/i.test(String(val ?? '').trim());
}

function renderMarks() {
  if (!$('marks-section')) return;
  const fac = isFaculty();
  const div = currentDivision();

  if ($('mk-division')) $('mk-division').value = div;

  const subs = subjectsList();
  if (!subs.some(s => s.code === mkSelectedSubject)) {
    mkSelectedSubject = subs[0] ? subs[0].code : 'CS301';
  }
  const subSel = $('mk-subject');
  if (subSel) {
    subSel.innerHTML = subs.map(s => `<option value="${escapeHtml(s.code)}">${escapeHtml(s.code + ' · ' + s.name)}</option>`).join('');
    subSel.value = mkSelectedSubject;
  }

  $('mk-faculty-wrap').hidden = !fac;
  $('mk-student-wrap').hidden = fac;
  if ($('mk-subject')) {
    $('mk-subject').style.display = fac ? '' : 'none';
    const lbl = document.querySelector('label[for="mk-subject"]');
    if (lbl) lbl.style.display = fac ? '' : 'none';
  }

  const activeSub = subs.find(s => s.code === mkSelectedSubject) || { code: mkSelectedSubject, name: 'Practical' };
  const divShort = div.replace('CSE-', 'SE ');
  if ($('mk-sheet-heading')) {
    $('mk-sheet-heading').textContent = `${activeSub.name.toUpperCase()} (${activeSub.code}) PRACTICAL MARKS ${divShort}`;
  }

  if (fac) {
    if ($('mk-thead')) $('mk-thead').innerHTML = buildMarksThead('Name of Student', true);
    const roster = getRoster();
    const sheetData = getMarksData(div, mkSelectedSubject);
    $('mk-tbody').innerHTML = roster.map((st, rIdx) => {
      const rowObj = sheetData[st.id] || {};
      const avg = calcRowAvg(rowObj);
      const cells = MK_COLS.map((colObj, cIdx) => {
        const val = rowObj[colObj.key] ?? '';
        const isDate = colObj.type === 'date';
        const abClass = !isDate && isAbsentVal(val) ? ' is-ab' : '';
        const dateClass = isDate ? ' mk-input-date' : '';
        const ph = isDate ? 'dd/mm' : '';
        return `<td><input type="text" class="mk-input${dateClass}${abClass}" placeholder="${ph}" data-mk-student="${escapeHtml(st.id)}" data-mk-col="${colObj.key}" data-mk-type="${colObj.type}" data-r="${rIdx}" data-c="${cIdx}" value="${escapeHtml(val)}" aria-label="${escapeHtml(st.name + ' ' + colObj.label)}"></td>`;
      }).join('');
      return `<tr>
        <td class="mk-rno-cell">${rIdx + 1}</td>
        <td class="mk-name-cell">${escapeHtml(st.name)}<small>${escapeHtml(st.roll)}</small></td>
        ${cells}
        <td class="mk-avg-cell" id="mk-avg-${escapeHtml(st.id)}">${avg}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="35" style="padding:16px;text-align:center;">No students in this division.</td></tr>';
  } else {
    if ($('mk-student-thead')) $('mk-student-thead').innerHTML = buildMarksThead('Subject', false);
    $('mk-student-tbody').innerHTML = subs.map(s => {
      const sheetData = getMarksData(div, s.code);
      const myRow = sheetData[username] || {};
      const avg = calcRowAvg(myRow);
      const cells = MK_COLS.map(colObj => {
        const val = myRow[colObj.key] ?? '';
        const isDate = colObj.type === 'date';
        const ab = !isDate && isAbsentVal(val);
        const cls = isDate ? 'mk-ro-date' : `mk-ro-cell${ab ? ' is-ab' : ''}`;
        return `<td class="${cls}">${val !== '' ? escapeHtml(val) : '—'}</td>`;
      }).join('');
      return `<tr>
        <td class="mk-name-cell"><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.code)}</small></td>
        ${cells}
        <td class="mk-avg-cell">${avg}</td>
      </tr>`;
    }).join('');
  }
}

document.addEventListener('input', e => {
  const inp = e.target.closest('.mk-input');
  if (!inp || !isFaculty()) return;
  const stId = inp.dataset.mkStudent;
  const col = inp.dataset.mkCol;
  const isDate = inp.dataset.mkType === 'date';
  const val = inp.value.trim();

  if (!isDate) inp.classList.toggle('is-ab', isAbsentVal(val));

  const div = currentDivision();
  const sheetData = getMarksData(div, mkSelectedSubject);
  sheetData[stId] = sheetData[stId] || {};
  sheetData[stId][col] = val;
  save(mkKey(div, mkSelectedSubject), sheetData);

  const avgCell = $('mk-avg-' + stId);
  if (avgCell) avgCell.textContent = calcRowAvg(sheetData[stId]);
});

document.addEventListener('keydown', e => {
  const inp = e.target.closest('.mk-input');
  if (!inp) return;
  const r = Number(inp.dataset.r), c = Number(inp.dataset.c);
  let nextR = r, nextC = c;
  if (e.key === 'Enter' || e.key === 'ArrowDown') { nextR = r + 1; }
  else if (e.key === 'ArrowUp') { nextR = r - 1; }
  else if (e.key === 'ArrowRight' && inp.selectionEnd === inp.value.length) { nextC = c + 1; }
  else if (e.key === 'ArrowLeft' && inp.selectionStart === 0) { nextC = c - 1; }
  else return;

  const target = document.querySelector(`.mk-input[data-r="${nextR}"][data-c="${nextC}"]`);
  if (target) {
    e.preventDefault();
    target.focus();
    target.select();
  }
});

if ($('mk-division')) {
  $('mk-division').addEventListener('change', e => {
    if ($('global-division')) $('global-division').value = e.target.value;
    if ($('tt-division-select')) $('tt-division-select').value = e.target.value;
    render();
    toast(`Switched Marks Sheet to ${currentDivision()}`);
  });
}

if ($('mk-subject')) {
  $('mk-subject').addEventListener('change', e => {
    mkSelectedSubject = e.target.value;
    renderMarks();
  });
}

if ($('mk-save-btn')) {
  $('mk-save-btn').addEventListener('click', () => {
    toast(`DOP, DOC & Marks saved for ${mkSelectedSubject} (${currentDivision()}).`);
  });
}

if ($('mk-clear-btn')) {
  $('mk-clear-btn').addEventListener('click', () => {
    if (!isFaculty()) return;
    if (!confirm(`Clear all DOP, DOC, and marks for ${mkSelectedSubject} in ${currentDivision()}?`)) return;
    save(mkKey(currentDivision(), mkSelectedSubject), {});
    renderMarks();
    toast('Marks & dates cleared.');
  });
}

if ($('mk-export-btn')) {
  $('mk-export-btn').addEventListener('click', () => {
    const div = currentDivision();
    const roster = getRoster();
    const sheetData = getMarksData(div, mkSelectedSubject);
    const header = ['R. No', 'Roll ID', 'Name of Student', ...MK_CSV_HEADERS, 'AVG'];
    const rows = roster.map((st, idx) => {
      const r = sheetData[st.id] || {};
      return [idx + 1, st.roll, st.name, ...MK_COLS.map(c => r[c.key] ?? ''), calcRowAvg(r)];
    });
    downloadCsv(`practical-marks-dop-doc-${div}-${mkSelectedSubject}.csv`, [header, ...rows]);
  });
}
/* =====================  MOBILE SIDEBAR DRAWER  ===================== */
if ($('mobile-menu-btn')) {
  $('mobile-menu-btn').addEventListener('click', e => {
    e.stopPropagation();
    document.querySelector('.sidebar')?.classList.toggle('open');
  });
}
document.addEventListener('click', e => {
  const sb = document.querySelector('.sidebar');
  if (!sb || !sb.classList.contains('open')) return;
  if (!e.target.closest('.sidebar') || e.target.closest('.nav-item')) {
    sb.classList.remove('open');
  }
});
// Restore the last signed-in session (supports all 40 students A-01..D-10 + faculty)
const remembered = (localStorage.getItem('aicte_username') || '').toLowerCase();
if (remembered && ACCOUNTS[remembered]) {
  username = remembered;
  login(remembered);
} else {
  $('login-view').hidden = false;
  $('dashboard-view').hidden = true;
}