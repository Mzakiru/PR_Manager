// ==== Data Storage ====

let users = [
  {username: "admin", password: "admin", role: "admin"},
  {username: "pruser", password: "prpass", role: "pr_officer"},
  {username: "eventmgr", password: "eventpass", role: "event_manager"}
];

let currentUser = null;

// Tasks
let tasks = [];
// Events
let events = [];
// Contacts
let contacts = [];
// Reports & News
let reports = [];
// Challenges & Suggestions
let challenges = [];
// Notifications
let notifications = [];
// Cases
let cases = [];
// Alumni
let alumni = [];
// User Management (for admin only)
let systemUsers = [...users];

// === Utility Functions ===

function $(id) {
  return document.getElementById(id);
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $(pageId).classList.add("active");
  // Also update sidebar active
  document.querySelectorAll("#sidebar ul li").forEach(li => {
    if (li.dataset.page === pageId.replace("page-", "")) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });
  // Render content for the page
  switch (pageId) {
    case "page-dashboard": renderDashboard(); break;
    case "page-tasks": renderTasks(); break;
    case "page-events": renderEvents(); break;
    case "page-calendar": renderCalendar(); break;
    case "page-contacts": renderContacts(); break;
    case "page-reports": renderReports(); break;
    case "page-challenges": renderChallenges(); break;
    case "page-notifications": renderNotifications(); break;
    case "page-cases": renderCases(); break;
    case "page-alumni": renderAlumni(); break;
    case "page-users": renderUsers(); break;
  }
}

// Simple ID generator
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Show/hide modal
function toggleModal(modalId, show) {
  const modal = $(modalId);
  if (show) {
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
  }
}

// Clear form inputs inside a form element
function clearForm(formId) {
  const form = $(formId);
  form.reset();
  if(form.dataset.editingId) delete form.dataset.editingId;
}

// === LOGIN LOGIC ===

$("login-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const username = $("username").value.trim();
  const password = $("password").value.trim();
  const role = $("role-select").value;

  const user = users.find(u => u.username === username && u.password === password && u.role === role);
  if (user) {
    currentUser = user;
    // Show main app and hide login
    $("login-section").classList.add("hidden");
    $("main-app").classList.remove("hidden");

    // Show admin-only menu items only if admin
    document.querySelectorAll(".admin-only").forEach(el => {
      if(currentUser.role === "admin") {
        el.style.display = "block";
      } else {
        el.style.display = "none";
      }
    });

    showPage("page-dashboard");
  } else {
    $("login-error").textContent = "Invalid username, password or role.";
  }
});

// Logout
$("logout-btn").addEventListener("click", () => {
  currentUser = null;
  $("main-app").classList.add("hidden");
  $("login-section").classList.remove("hidden");
  $("login-error").textContent = "";
  $("login-form").reset();
});

// === SIDEBAR NAVIGATION ===
document.querySelectorAll("#sidebar ul li").forEach(li => {
  if (li.id !== "logout-btn") {
    li.addEventListener("click", () => {
      if(li.classList.contains("admin-only") && currentUser.role !== "admin") return;
      showPage("page-" + li.dataset.page);
    });
  }
});

// ==== DASHBOARD ====

function renderDashboard() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;

  $("dash-total-tasks").textContent = totalTasks;
  $("dash-completed").textContent = completedTasks;
  $("dash-in-progress").textContent = inProgressTasks;

  // Upcoming events in next 30 days
  const now = new Date();
  const upcomingEvents = events.filter(ev => {
    const evDate = new Date(ev.date);
    const diffDays = (evDate - now) / (1000*60*60*24);
    return diffDays >= 0 && diffDays <= 30;
  });
  const ulEvents = $("dash-upcoming-events");
  ulEvents.innerHTML = "";
  if(upcomingEvents.length === 0) {
    ulEvents.innerHTML = "<li>No upcoming events in 30 days</li>";
  } else {
    upcomingEvents.forEach(ev => {
      ulEvents.innerHTML += `<li>${ev.title} - ${ev.date}</li>`;
    });
  }

  // Notifications (important = true)
  const importantNotifs = notifications.filter(n => n.important);
  const ulNotifs = $("dash-notifications");
  ulNotifs.innerHTML = "";
  if(importantNotifs.length === 0) {
    ulNotifs.innerHTML = "<li>No important notifications</li>";
  } else {
    importantNotifs.forEach(n => {
      ulNotifs.innerHTML += `<li>${n.message} (${n.date})</li>`;
    });
  }

  // Sample: PR communications and reports made counts
  $("dash-pr-communications").textContent = reports.length; // for demo, assume each report is a communication
  $("dash-reports-made").textContent = reports.length;
}

// ==== TASKS ====

function renderTasks() {
  const filterStatus = $("task-filter-status").value;
  const filterDate = $("task-filter-date").value;
  const filterAssignee = $("task-filter-assignee").value.toLowerCase();

  let filteredTasks = tasks;
  if (filterStatus !== "all") {
    filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
  }
  if (filterDate) {
    filteredTasks = filteredTasks.filter(t => t.dueDate === filterDate);
  }
  if (filterAssignee) {
    filteredTasks = filteredTasks.filter(t => t.assigned.toLowerCase().includes(filterAssignee));
  }

  const taskList = $("task-list");
  taskList.innerHTML = "";
  if(filteredTasks.length === 0) {
    taskList.innerHTML = "<li>No tasks found.</li>";
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${task.title}</strong> [${task.status}] [Priority: ${task.priority}]
      <p>${task.description || ""}</p>
      <small>Assigned to: ${task.assigned}</small><br />
      <small>Start: ${task.startDate} | Due: ${task.dueDate}</small>
      <div>
        <button onclick="editTask('${task.id}')">✏️ Edit</button>
        <button onclick="deleteTask('${task.id}')">🗑️ Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

$("add-task-btn").addEventListener("click", () => {
  clearForm("task-form");
  $("task-modal-title").textContent = "Add Task";
  toggleModal("task-modal", true);
});

$("task-cancel-btn").addEventListener("click", () => toggleModal("task-modal", false));

$("task-form").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("task-title").value.trim();
  const description = $("task-desc").value.trim();
  const startDate = $("task-start-date").value;
  const dueDate = $("task-due-date").value;
  const assigned = $("task-assigned").value.trim();
  const status = $("task-status").value;
  const priority = $("task-priority").value;

  if(!title || !startDate || !dueDate || !assigned) {
    alert("Please fill required fields.");
    return;
  }

  const form = $("task-form");
  const editingId = form.dataset.editingId;

  if(editingId) {
    // Edit existing
    const task = tasks.find(t => t.id === editingId);
    if(task) {
      task.title = title;
      task.description = description;
      task.startDate = startDate;
      task.dueDate = dueDate;
      task.assigned = assigned;
      task.status = status;
      task.priority = priority;
    }
    delete form.dataset.editingId;
  } else {
    // Add new
    tasks.push({
      id: generateId(),
      title, description, startDate, dueDate, assigned, status, priority
    });
  }
  toggleModal("task-modal", false);
  renderTasks();
});

// Edit and Delete Functions
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if(!task) return;
  $("task-title").value = task.title;
  $("task-desc").value = task.description;
  $("task-start-date").value = task.startDate;
  $("task-due-date").value = task.dueDate;
  $("task-assigned").value = task.assigned;
  $("task-status").value = task.status;
  $("task-priority").value = task.priority;
  $("task-modal-title").textContent = "Edit Task";
  $("task-form").dataset.editingId = id;
  toggleModal("task-modal", true);
}

function deleteTask(id) {
  if(confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  }
}

// Task Filters
$("task-filter-status").addEventListener("change", renderTasks);
$("task-filter-date").addEventListener("change", renderTasks);
$("task-filter-assignee").addEventListener("input", renderTasks);
$("task-filter-clear").addEventListener("click", () => {
  $("task-filter-status").value = "all";
  $("task-filter-date").value = "";
  $("task-filter-assignee").value = "";
  renderTasks();
});

// ==== EVENTS ====

function renderEvents() {
  const eventList = $("event-list");
  eventList.innerHTML = "";
  if(events.length === 0) {
    eventList.innerHTML = "<li>No events scheduled.</li>";
    return;
  }
  events.forEach(ev => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${ev.title}</strong> - ${ev.date} <br/>
      Location: ${ev.location || "N/A"}<br/>
      Participants: ${ev.participants || "None"}
      <div>
        <button onclick="editEvent('${ev.id}')">✏️ Edit</button>
        <button onclick="deleteEvent('${ev.id}')">🗑️ Delete</button>
      </div>
    `;
    eventList.appendChild(li);
  });
}

$("add-event-btn").addEventListener("click", () => {
  clearForm("event-form");
  $("event-modal-title").textContent = "Add Event";
  toggleModal("event-modal", true);
});
$("event-cancel-btn").addEventListener("click", () => toggleModal("event-modal", false));
$("event-form").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("event-title").value.trim();
  const date = $("event-date").value;
  const location = $("event-location").value.trim();
  const participants = $("event-participants").value.trim();

  if(!title || !date) {
    alert("Please fill required fields.");
    return;
  }

  const form = $("event-form");
  const editingId = form.dataset.editingId;

  if(editingId) {
    const ev = events.find(ev => ev.id === editingId);
    if(ev) {
      ev.title = title;
      ev.date = date;
      ev.location = location;
      ev.participants = participants;
    }
    delete form.dataset.editingId;
  } else {
    events.push({id: generateId(), title, date, location, participants});
  }
  toggleModal("event-modal", false);
  renderEvents();
});

function editEvent(id) {
  const ev = events.find(ev => ev.id === id);
  if(!ev) return;
  $("event-title").value = ev.title;
  $("event-date").value = ev.date;
  $("event-location").value = ev.location;
  $("event-participants").value = ev.participants;
  $("event-modal-title").textContent = "Edit Event";
  $("event-form").dataset.editingId = id;
  toggleModal("event-modal", true);
}

function deleteEvent(id) {
  if(confirm("Delete this event?")) {
    events = events.filter(ev => ev.id !== id);
    renderEvents();
  }
}

// ==== CALENDAR ====

function renderCalendar() {
  // Simple text calendar showing tasks and events by date
  const calendarDiv = $("calendar");
  calendarDiv.innerHTML = "";

  // Create a current month calendar
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  const calendarTable = document.createElement("table");
  calendarTable.style.width = "100%";
  calendarTable.style.borderCollapse = "collapse";
  const headerRow = document.createElement("tr");
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    th.style.border = "1px solid #ccc";
    th.style.padding = "6px";
    th.style.backgroundColor = "#2f855a";
    th.style.color = "white";
    headerRow.appendChild(th);
  });
  calendarTable.appendChild(headerRow);

  let row = document.createElement("tr");
  let dayOfWeek = firstDay.getDay();

  // Pad empty cells before first day
  for(let i=0; i<dayOfWeek; i++){
    const td = document.createElement("td");
    td.style.border = "1px solid #ccc";
    td.style.height = "80px";
    row.appendChild(td);
  }

  for(let date=1; date <= totalDays; date++){
    if(dayOfWeek === 7){
      calendarTable.appendChild(row);
      row = document.createElement("tr");
      dayOfWeek = 0;
    }

    const td = document.createElement("td");
    td.style.border = "1px solid #ccc";
    td.style.padding = "4px";
    td.style.verticalAlign = "top";
    td.style.height = "80px";
    td.style.fontSize = "0.8rem";

    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(date).padStart(2,"0")}`;
    td.innerHTML = `<strong>${date}</strong><br/>`;

    // List tasks due this day
    const tasksToday = tasks.filter(t => t.dueDate === dateStr);
    tasksToday.forEach(t => {
      const p = document.createElement("p");
      p.textContent = "Task: " + t.title;
      p.style.backgroundColor = "#c6f6d5";
      p.style.margin = "2px 0";
      p.style.padding = "2px 4px";
      p.style.borderRadius = "4px";
      td.appendChild(p);
    });

    // List events on this day
    const eventsToday = events.filter(ev => ev.date === dateStr);
    eventsToday.forEach(ev => {
      const p = document.createElement("p");
      p.textContent = "Event: " + ev.title;
      p.style.backgroundColor = "#81e6d9";
      p.style.margin = "2px 0";
      p.style.padding = "2px 4px";
      p.style.borderRadius = "4px";
      td.appendChild(p);
    });

    row.appendChild(td);
    dayOfWeek++;
  }

  // Pad empty cells after last day
  while(dayOfWeek < 7){
    const td = document.createElement("td");
    td.style.border = "1px solid #ccc";
    td.style.height = "80px";
    row.appendChild(td);
    dayOfWeek++;
  }
  calendarTable.appendChild(row);

  calendarDiv.appendChild(calendarTable);
}

// ==== CONTACTS ====

function renderContacts() {
  const contactList = $("contact-list");
  contactList.innerHTML = "";
  if(contacts.length === 0){
    contactList.innerHTML = "<li>No contacts found.</li>";
    return;
  }
  contacts.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.name}</strong><br/>
      Phone: ${c.phone || "-"}<br/>
      Email: ${c.email || "-"}<br/>
      Address: ${c.address || "-"}
      <div>
        <button onclick="editContact('${c.id}')">✏️ Edit</button>
        <button onclick="deleteContact('${c.id}')">🗑️ Delete</button>
      </div>
    `;
    contactList.appendChild(li);
  });
}

$("add-contact-btn").addEventListener("click", () => {
  clearForm("contact-form");
  $("contact-modal-title").textContent = "Add Contact";
  toggleModal("contact-modal", true);
});
$("contact-cancel-btn").addEventListener("click", () => toggleModal("contact-modal", false));
$("contact-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("contact-name").value.trim();
  const phone = $("contact-phone").value.trim();
  const email = $("contact-email").value.trim();
  const address = $("contact-address").value.trim();

  if(!name){
    alert("Name is required.");
    return;
  }
  const form = $("contact-form");
  const editingId = form.dataset.editingId;

  if(editingId){
    const contact = contacts.find(c => c.id === editingId);
    if(contact){
      contact.name = name;
      contact.phone = phone;
      contact.email = email;
      contact.address = address;
    }
    delete form.dataset.editingId;
  } else {
    contacts.push({
      id: generateId(),
      name, phone, email, address
    });
  }
  toggleModal("contact-modal", false);
  renderContacts();
});

function editContact(id){
  const contact = contacts.find(c => c.id === id);
  if(!contact) return;
  $("contact-name").value = contact.name;
  $("contact-phone").value = contact.phone;
  $("contact-email").value = contact.email;
  $("contact-address").value = contact.address;
  $("contact-modal-title").textContent = "Edit Contact";
  $("contact-form").dataset.editingId = id;
  toggleModal("contact-modal", true);
}

function deleteContact(id){
  if(confirm("Delete this contact?")){
    contacts = contacts.filter(c => c.id !== id);
    renderContacts();
  }
}

// ==== REPORTS & NEWS ====

function renderReports() {
  const reportList = $("report-list");
  reportList.innerHTML = "";
  if(reports.length === 0){
    reportList.innerHTML = "<li>No reports or news.</li>";
    return;
  }
  reports.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${r.title}</strong> (${r.date})<br/>
      <p>${r.content}</p>
      <div>
        <button onclick="editReport('${r.id}')">✏️ Edit</button>
        <button onclick="deleteReport('${r.id}')">🗑️ Delete</button>
      </div>
    `;
    reportList.appendChild(li);
  });
}

$("add-report-btn").addEventListener("click", () => {
  clearForm("report-form");
  $("report-modal-title").textContent = "Add Report / News";
  toggleModal("report-modal", true);
});
$("report-cancel-btn").addEventListener("click", () => toggleModal("report-modal", false));
$("report-form").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("report-title").value.trim();
  const content = $("report-content").value.trim();
  const date = $("report-date").value;

  if(!title || !content || !date){
    alert("Please fill all fields.");
    return;
  }

  const form = $("report-form");
  const editingId = form.dataset.editingId;

  if(editingId){
    const r = reports.find(r => r.id === editingId);
    if(r){
      r.title = title;
      r.content = content;
      r.date = date;
    }
    delete form.dataset.editingId;
  } else {
    reports.push({id: generateId(), title, content, date});
  }
  toggleModal("report-modal", false);
  renderReports();
});

function editReport(id){
  const r = reports.find(r => r.id === id);
  if(!r) return;
  $("report-title").value = r.title;
  $("report-content").value = r.content;
  $("report-date").value = r.date;
  $("report-modal-title").textContent = "Edit Report / News";
  $("report-form").dataset.editingId = id;
  toggleModal("report-modal", true);
}

function deleteReport(id){
  if(confirm("Delete this report/news?")){
    reports = reports.filter(r => r.id !== id);
    renderReports();
  }
}

// ==== CHALLENGES & SUGGESTIONS ====

function renderChallenges() {
  const challengeList = $("challenge-list");
  challengeList.innerHTML = "";
  if(challenges.length === 0){
    challengeList.innerHTML = "<li>No challenges or suggestions.</li>";
    return;
  }
  challenges.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.title}</strong> (${c.date})<br/>
      <p>${c.content}</p>
      <div>
        <button onclick="editChallenge('${c.id}')">✏️ Edit</button>
        <button onclick="deleteChallenge('${c.id}')">🗑️ Delete</button>
      </div>
    `;
    challengeList.appendChild(li);
  });
}

$("add-challenge-btn").addEventListener("click", () => {
  clearForm("challenge-form");
  $("challenge-modal-title").textContent = "Add Challenge / Suggestion";
  toggleModal("challenge-modal", true);
});
$("challenge-cancel-btn").addEventListener("click", () => toggleModal("challenge-modal", false));
$("challenge-form").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("challenge-title").value.trim();
  const content = $("challenge-content").value.trim();
  const date = $("challenge-date").value;

  if(!title || !content || !date){
    alert("Please fill all fields.");
    return;
  }

  const form = $("challenge-form");
  const editingId = form.dataset.editingId;

  if(editingId){
    const c = challenges.find(c => c.id === editingId);
    if(c){
      c.title = title;
      c.content = content;
      c.date = date;
    }
    delete form.dataset.editingId;
  } else {
    challenges.push({id: generateId(), title, content, date});
  }
  toggleModal("challenge-modal", false);
  renderChallenges();
});

function editChallenge(id){
  const c = challenges.find(c => c.id === id);
  if(!c) return;
  $("challenge-title").value = c.title;
  $("challenge-content").value = c.content;
  $("challenge-date").value = c.date;
  $("challenge-modal-title").textContent = "Edit Challenge / Suggestion";
  $("challenge-form").dataset.editingId = id;
  toggleModal("challenge-modal", true);
}

function deleteChallenge(id){
  if(confirm("Delete this challenge/suggestion?")){
    challenges = challenges.filter(c => c.id !== id);
    renderChallenges();
  }
}

// ==== NOTIFICATIONS ====

function renderNotifications() {
  const notifList = $("notification-list");
  notifList.innerHTML = "";
  if(notifications.length === 0){
    notifList.innerHTML = "<li>No notifications.</li>";
    return;
  }
  notifications.forEach(n => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${n.message} (${n.date}) <strong>${n.important ? "(Important)" : ""}</strong>
      <div>
        <button onclick="editNotification('${n.id}')">✏️ Edit</button>
        <button onclick="deleteNotification('${n.id}')">🗑️ Delete</button>
      </div>
    `;
    notifList.appendChild(li);
  });
}

$("add-notification-btn").addEventListener("click", () => {
  clearForm("notification-form");
  $("notification-modal-title").textContent = "Add Notification";
  toggleModal("notification-modal", true);
});
$("notification-cancel-btn").addEventListener("click", () => toggleModal("notification-modal", false));
$("notification-form").addEventListener("submit", e => {
  e.preventDefault();
  const message = $("notification-message").value.trim();
  const date = $("notification-date").value;
  const important = $("notification-important").checked;

  if(!message || !date){
    alert("Please fill all fields.");
    return;
  }

  const form = $("notification-form");
  const editingId = form.dataset.editingId;

  if(editingId){
    const n = notifications.find(n => n.id === editingId);
    if(n){
      n.message = message;
      n.date = date;
      n.important = important;
    }
    delete form.dataset.editingId;
  } else {
    notifications.push({id: generateId(), message, date, important});
  }
  toggleModal("notification-modal", false);
  renderNotifications();
});

function editNotification(id){
  const n = notifications.find(n => n.id === id);
  if(!n) return;
  $("notification-message").value = n.message;
  $("notification-date").value = n.date;
  $("notification-important").checked = n.important;
  $("notification-modal-title").textContent = "Edit Notification";
  $("notification-form").dataset.editingId = id;
  toggleModal("notification-modal", true);
}

function deleteNotification(id){
  if(confirm("Delete this notification?")){
    notifications = notifications.filter(n => n.id !== id);
    renderNotifications();
  }
}

// ==== CASES ====

function renderCases() {
  const caseList = $("case-list");
  caseList.innerHTML = "";
  if(cases.length === 0){
    caseList.innerHTML = "<li>No cases.</li>";
    return;
  }
  cases.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.title}</strong> (${c.status})<br/>
      <p>${c.description}</p>
      <div>
        <button onclick="editCase('${c.id}')">✏️ Edit</button>
        <button onclick="deleteCase('${c.id}')">🗑️ Delete</button>
      </div>
    `;
    caseList.appendChild(li);
  });
}

$("add-case-btn").addEventListener("click", () => {
  clearForm("case-form");
  $("case-modal-title").textContent = "Add Case";
  toggleModal("case-modal", true);
});
$("case-cancel-btn").addEventListener("click", () => toggleModal("case-modal", false));
$("case-form").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("case-title").value.trim();
  const description = $("case-desc").value.trim();
  const status = $("case-status").value;

  if(!title){
    alert("Title is required.");
    return;
  }

  const form = $("case-form");
  const editingId = form.dataset.editingId;

  if(editingId){
    const c = cases.find(c => c.id === editingId);
    if(c){
      c.title = title;
      c.description = description;
      c.status = status;
    }
    delete form.dataset.editingId;
  } else {
    cases.push({id: generateId(), title, description, status});
  }
  toggleModal("case-modal", false);
  renderCases();
});

function editCase(id){
  const c = cases.find(c => c.id === id);
  if(!c) return;
  $("case-title").value = c.title;
  $("case-desc").value = c.description;
  $("case-status").value = c.status;
  $("case-modal-title").textContent = "Edit Case";
  $("case-form").dataset.editingId = id;
  toggleModal("case-modal", true);
}

function deleteCase(id){
  if(confirm("Delete this case?")){
    cases = cases.filter(c => c.id !== id);
    renderCases();
  }
}

// ==== ALUMNI ====

function renderAlumni() {
  const alumniList = $("alumni-list");
  alumniList.innerHTML = "";
  if(alumni.length === 0){
    alumniList.innerHTML = "<li>No alumni members.</li>";
    return;
  }
  alumni.forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.name}</strong> (Graduation Year: ${a.year})<br/>
      Phone: ${a.phone || "-"}
      <div>
        <button onclick="editAlumni('${a.id}')">✏️ Edit</button>
        <button onclick="deleteAlumni('${a.id}')">🗑️ Delete</button>
      </div>
    `;
    alumniList.appendChild(li);
  });
}

$("add-alumni-btn").addEventListener("click", () => {
  clearForm("alumni-form");
  $("alumni-modal-title").textContent = "Add Alumni Member";
  toggleModal("alumni-modal", true);
});
$("alumni-cancel-btn").addEventListener("click", () => toggleModal("alumni-modal", false));
$("alumni-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("alumni-name").value.trim();
  const year = $("alumni-year").value.trim();
  const phone = $("alumni-phone").value.trim();

  if(!name || !year){
    alert("Please fill required fields.");
    return;
  }

  const form = $("alumni-form");
  const editingId = form.dataset.editingId;

  if(editingId){
    const a = alumni.find(a => a.id === editingId);
    if(a){
      a.name = name;
      a.year = year;
      a.phone = phone;
    }
    delete form.dataset.editingId;
  } else {
    alumni.push({id: generateId(), name, year, phone});
  }
  toggleModal("alumni-modal", false);
  renderAlumni();
});

function editAlumni(id){
  const a = alumni.find(a => a.id === id);
  if(!a) return;
  $("alumni-name").value = a.name;
  $("alumni-year").value = a.year;
  $("alumni-phone").value = a.phone;
  $("alumni-modal-title").textContent = "Edit Alumni Member";
  $("alumni-form").dataset.editingId = id;
  toggleModal("alumni-modal", true);
}

function deleteAlumni(id){
  if(confirm("Delete this alumni member?")){
    alumni = alumni.filter(a => a.id !== id);
    renderAlumni();
  }
}

// ==== USER MANAGEMENT ====

function renderUsers() {
  const userList = $("user-list");
  userList.innerHTML = "";
  if(systemUsers.length === 0){
    userList.innerHTML = "<li>No users found.</li>";
    return;
  }
  systemUsers.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${u.username}</strong> (${u.role})
      <div>
        <button onclick="editUser('${u.username}')">✏️ Edit</button>
        <button onclick="deleteUser('${u.username}')">🗑️ Delete</button>
      </div>
    `;
    userList.appendChild(li);
  });
}

$("add-user-btn").addEventListener("click", () => {
  clearForm("user-form");
  $("user-modal-title").textContent = "Add User";
  toggleModal("user-modal", true);
});
$("user-cancel-btn").addEventListener("click", () => toggleModal("user-modal", false));
$("user-form").addEventListener("submit", e => {
  e.preventDefault();
  const username = $("user-username").value.trim();
  const password = $("user-password").value.trim();
  const role = $("user-role").value;

  if(!username || !password){
    alert("Please fill required fields.");
    return;
  }

  const form = $("user-form");
  const editingId = form.dataset.editingId;

  if(editingId){
    const u = systemUsers.find(u => u.username === editingId);
    if(u){
      u.username = username;
      u.password = password;
      u.role = role;
    }
    delete form.dataset.editingId;
  } else {
    if(systemUsers.some(u => u.username === username)){
      alert("Username already exists.");
      return;
    }
    systemUsers.push({username, password, role});
  }
  toggleModal("user-modal", false);
  renderUsers();
});

function editUser(username){
  const u = systemUsers.find(u => u.username === username);
  if(!u) return;
  $("user-username").value = u.username;
  $("user-password").value = u.password;
  $("user-role").value = u.role;
  $("user-modal-title").textContent = "Edit User";
  $("user-form").dataset.editingId = username;
  toggleModal("user-modal", true);
}

function deleteUser(username){
  if(confirm("Delete this user?")){
    systemUsers = systemUsers.filter(u => u.username !== username);
    renderUsers();
  }
}

// Initial page load setup
document.addEventListener("DOMContentLoaded", () => {
  if(!currentUser){
    $("login-section").classList.remove("hidden");
    $("main-app").classList.add("hidden");
  }
});
