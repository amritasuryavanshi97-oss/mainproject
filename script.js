const API = "http://localhost:8081/api";
const $ = id => document.getElementById(id);

let user = null;
let timetable = [];
let students = [];
let attendance = {};

const DIVISIONS = ["A", "B", "C", "D"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function api(path, options = {}) {
  const token = localStorage.getItem("campusloop_token");
  const headers = { ...(options.headers || {}) };

  if (token) headers.Authorization = "Bearer " + token;

  const response = await fetch(API + path, { ...options, headers });
  let data = {};

  try {
    data = await response.json();
  } catch (error) {}

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function showSection(section) {
  document.querySelectorAll(".page-section").forEach(sectionElement => {
    sectionElement.hidden = sectionElement.id !== section + "-section";
  });

  document.querySelectorAll(".nav-item[data-section]").forEach(button => {
    button.classList.toggle("active", button.dataset.section === section);
  });

  const titles = {
    overview: "Overview",
    timetable: "Division timetable",
    students: "Students by division",
    attendance: "Mark attendance",
    checkin: "AICTE check-in"
  };

  $("page-title").textContent = titles[section] || "Overview";
}

function login(data) {
  user = data;

  localStorage.setItem("campusloop_token", data.token);
  localStorage.setItem("campusloop_user", JSON.stringify({
    username: data.username,
    name: data.name,
    role: data.role,
    division: data.division
  }));

  $("login-view").hidden = true;
  $("dashboard-view").hidden = false;

  $("profile-name").textContent = data.name;
  $("profile-role").textContent = data.role === "faculty"
    ? "Faculty"
    : "Division " + data.division;

  $("avatar").textContent = data.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  $("role-label").textContent = data.role === "faculty"
    ? "FACULTY WORKSPACE"
    : "STUDENT SPACE";

  $("welcome-title").textContent = "Hello, " + data.name.split(" ")[0] + "!";
  $("ov-division").textContent = data.role === "faculty" ? "All" : data.division;

  fillDivisionSelects();
  loadStudents();
  loadTimetable(data.division || "A");
  loadStatus();

  showSection("overview");
}

function logout() {
  localStorage.removeItem("campusloop_token");
  localStorage.removeItem("campusloop_user");
  user = null;

  $("dashboard-view").hidden = true;
  $("login-view").hidden = false;
}

function fillDivisionSelects() {
  const options = DIVISIONS
    .map(division => `<option value="${division}">Division ${division}</option>`)
    .join("");

  $("division-select").innerHTML = options;
  $("att-division").innerHTML = options;

  if (user && user.role === "student") {
    $("division-select").value = user.division;
    $("att-division").value = user.division;
    $("att-division").disabled = true;
  } else {
    $("att-division").disabled = false;
  }
}

async function loadStudents() {
  if (!user || user.role !== "faculty") {
    $("students-list").innerHTML = "<p class='muted'>Student directory is available to faculty.</p>";
    return;
  }

  const data = await api("/students");
  students = data.students;

  const html = DIVISIONS.map(division => {
    const list = students.filter(student => student.division === division);

    return `
      <div class="division-card">
        <h3>Division ${division}</h3>
        <small>${list.length} students</small>
        <ul>
          ${list.map(student => `
            <li>
              <strong>${escapeHtml(student.name)}</strong>
              <small>${escapeHtml(student.id)}</small>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }).join("");

  $("students-list").innerHTML = html;
}

async function loadTimetable(division) {
  division = division || "A";
  const data = await api("/timetable?division=" + division);
  timetable = data.timetable;

  $("timetable-grid").innerHTML = DAYS.map(day => {
    const lecture = timetable.find(item => item.day === day);

    return `
      <div class="tt-day">
        <h4>${day.slice(0, 3)}</h4>

        ${lecture ? `
          <div class="tt-slot">
            <b>${lecture.start}–${lecture.end}</b>
            <strong>${escapeHtml(lecture.subject)}</strong>
            <small>${escapeHtml(lecture.faculty)}</small>
          </div>
        ` : "<p class='muted tt-empty'>No lecture</p>"}
      </div>
    `;
  }).join("");
}

async function loadAttendance() {
  const division = $("att-division").value;
  const day = $("att-day").value;

  const lecture = timetable.find(item =>
    item.division === division && item.day === day
  );

  if (!lecture) {
    $("attendance-list").innerHTML =
      "<p class='muted'>No lecture scheduled for this division on this day.</p>";
    return;
  }

  const divisionStudents = students.filter(student => student.division === division);
  const key = division + "|" + day;
  const saved = attendance[key] || {};

  $("attendance-list").innerHTML = `
    <p class="hint">
      <strong>${escapeHtml(lecture.subject)}</strong>
      · ${lecture.start}–${lecture.end}
      · ${escapeHtml(lecture.faculty)}
    </p>

    <div class="attendance-grid">
      ${divisionStudents.map(student => `
        <div class="attendance-row">
          <span>${escapeHtml(student.name)}</span>
          <button class="seg-btn ${saved[student.id] === "Absent" ? "bun on" : "att on"}"
            data-student="${student.id}">
            ${saved[student.id] === "Absent" ? "Absent" : "Present"}
          </button>
        </div>
      `).join("")}
    </div>
  `;
}

function toggleAttendance(button) {
  const studentId = button.dataset.student;
  const division = $("att-division").value;
  const day = $("att-day").value;
  const key = division + "|" + day;

  attendance[key] = attendance[key] || {};

  if (attendance[key][studentId] === "Absent") {
    attendance[key][studentId] = "Present";
  } else {
    attendance[key][studentId] = "Absent";
  }

  loadAttendance();
}

function saveAttendance() {
  const division = $("att-division").value;
  const day = $("att-day").value;
  const key = division + "|" + day;

  localStorage.setItem(
    "campusloop_attendance",
    JSON.stringify(attendance)
  );

  toast("Attendance saved for Division " + division + " — " + day + ".");
}

async function loadStatus() {
  if (!user || user.role !== "student") return;

  const data = await api("/status");

  $("ov-points").textContent = data.points;
  $("ov-checkins").textContent = data.checkins;

  $("checkin-message").textContent = data.targetReached
    ? "You have reached the 100-point target."
    : `You have ${data.points} of 100 points. Each check-in gives 5 points.`;
}

$("login-form").addEventListener("submit", async event => {
  event.preventDefault();

  const username = $("username").value.trim().toLowerCase();
  const password = $("password").value;

  $("login-error").hidden = true;

  try {
    const data = await api("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    data.username = username;
    login(data);
  } catch (error) {
    $("login-error").textContent = error.message;
    $("login-error").hidden = false;
  }
});

document.querySelectorAll(".demo-chip").forEach(button => {
  button.addEventListener("click", () => {
    $("username").value = button.dataset.user;
    $("password").value = "demo123";
  });
});

document.querySelectorAll(".nav-item[data-section]").forEach(button => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

$("division-select").addEventListener("change", event => {
  loadTimetable(event.target.value);
});

$("att-load").addEventListener("click", loadAttendance);

$("attendance-list").addEventListener("click", event => {
  const button = event.target.closest("[data-student]");
  if (button) toggleAttendance(button);
});

$("att-save").addEventListener("click", saveAttendance);

$("checkin-btn").addEventListener("click", async () => {
  try {
    await api("/checkin", { method: "POST" });
    toast("Check-in recorded. +5 points.");
    loadStatus();
  } catch (error) {
    toast(error.message);
  }
});

$("logout-btn").addEventListener("click", async () => {
  try {
    await api("/logout", { method: "POST" });
  } catch (error) {}

  logout();
});

const savedUser = localStorage.getItem("campusloop_user");

if (savedUser) {
  try {
    const parsed = JSON.parse(savedUser);
    user = parsed;
    $("login-view").hidden = true;
    $("dashboard-view").hidden = false;

    $("profile-name").textContent = parsed.name;
    $("profile-role").textContent = parsed.role === "faculty"
      ? "Faculty"
      : "Division " + parsed.division;

    $("role-label").textContent = parsed.role === "faculty"
      ? "FACULTY WORKSPACE"
      : "STUDENT SPACE";

    fillDivisionSelects();
    loadStudents();
    loadTimetable(parsed.division || "A");
    loadStatus();
    showSection("overview");
  } catch (error) {
    localStorage.removeItem("campusloop_user");
  }
}
