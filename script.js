const GOOGLE_API = " https://script.google.com/macros/s/AKfycbxwO45itW4qEfRinjvhKSAFNMS6zcEHfWAO0_p59WejiKUbYhSIz_mlP5RzuFz76KJt/exec"
let tasks = [];
// Helper to select elements
const $ = (id) => document.getElementById(id);

const sections = document.querySelectorAll("main .section");
const navButtons = document.querySelectorAll("nav .nav-btn");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Switch active nav button
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Show matching section
    const sec = btn.dataset.section;
    sections.forEach(s => {
      s.classList.toggle("active", s.id === sec);
    });
  });
});

const modal = $("modal");
const modalTitle = $("modalTitle");
const modalForm = $("modalForm");
const modalCancelBtn = $("modalCancelBtn");

let currentEditId = null;
let currentType = null;

// Data stores
let tasks = [];
let events = [];
let contacts = [];
let reports = [];
let challenges = [];
let cases = [];
let alumni = [];
let users = [
  { username: "admin", password: "admin", role: "admin" }
];

// ========== Utility Functions ===========

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function closeModal() {
  modal.classList.add("hidden");
  modalForm.innerHTML = "";
  currentEditId = null;
  currentType = null;
}

modalCancelBtn.addEventListener("click", closeModal);

modalForm.addEventListener("submit", e => {
  e.preventDefault();
  handleFormSubmit();
});

// ========== Render Functions ===========

function renderDashboard() {
  $("totalTasks").textContent = tasks.length;
  $("completedTasks").textContent = tasks.filter(t => t.status === "completed").length;
  $("pendingTasks").textContent = tasks.filter(t => t.status === "pending").length;

  // Upcoming events (next 5)
  const upcoming = events.filter(ev => {
    const evDate = new Date(ev.date);
    return evDate >= new Date();
  }).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0,5);

  const ul = $("upcomingEvents");
  ul.innerHTML = "";
  if(upcoming.length === 0){
    ul.innerHTML = "<li>No upcoming events.</li>";
  } else {
    upcoming.forEach(ev => {
      ul.innerHTML += `<li>${ev.title} - ${ev.date}</li>`;
    });
  }
}

function renderList(type){
  let listEl;
  let items;
  switch(type){
    case "tasks":
      listEl = $("taskList");
      items = tasks;
      break;
    case "events":
      listEl = $("eventList");
      items = events;
      break;
    case "contacts":
      listEl = $("contactList");
      items = contacts;
      break;
    case "reports":
      listEl = $("reportList");
      items = reports;
      break;
    case "challenges":
      listEl = $("challengeList");
      items = challenges;
      break;
    case "cases":
      listEl = $("caseList");
      items = cases;
      break;
    case "alumni":
      listEl = $("alumniList");
      items = alumni;
      break;
    case "users":
      listEl = $("userList");
      items = users;
      break;
  }
  listEl.innerHTML = "";
  if(items.length === 0){
    listEl.innerHTML = "<li>No items found.</li>";
    return;
  }
  items.forEach(item => {
    let html = "";
    if(type === "tasks"){
      html = `<strong>${item.title}</strong> (${item.status}) - Assigned to: ${item.assignee || "-"}<br/>
              <small>Due: ${item.dueDate || "N/A"}</small>`;
    } else if(type === "events"){
      html = `<strong>${item.title}</strong> on ${item.date}<br/>
              Location: ${item.location || "-"}<br/>
              Participants: ${item.participants || "-"}`;
    } else if(type === "contacts"){
      html = `<strong>${item.name}</strong><br/>
              Phone: ${item.phone || "-"}, Email: ${item.email || "-"}<br/>
              Address: ${item.address || "-"}`;
    } else if(type === "reports"){
      html = `<strong>${item.title}</strong> (${item.date})<br/>${item.content}`;
    } else if(type === "challenges"){
      html = `<strong>${item.title}</strong> (${item.date})<br/>${item.content}`;
    } else if(type === "cases"){
      html = `<strong>${item.title}</strong> (${item.status})<br/>${item.description || "-"}`;
    } else if(type === "alumni"){
      html = `<strong>${item.name}</strong> (Graduated: ${item.year})<br/>Phone: ${item.phone || "-"}`;
    } else if(type === "users"){
      html = `<strong>${item.username}</strong> (${item.role})`;
    }
    listEl.innerHTML += `<li>${html}
      <div class="actions">
        <button onclick="editItem('${type}','${item.id}')">✏️</button>
        <button onclick="deleteItem('${type}','${item.id}')">🗑️</button>
      </div>
    </li>`;
  });
}

// ========== Event Listeners for Add Buttons ===========

$("addTaskBtn").addEventListener("click", () => openModal("tasks"));
$("addEventBtn").addEventListener("click", () => openModal("events"));
$("addContactBtn").addEventListener("click", () => openModal("contacts"));
$("addReportBtn").addEventListener("click", () => openModal("reports"));
$("addChallengeBtn").addEventListener("click", () => openModal("challenges"));
$("addCaseBtn").addEventListener("click", () => openModal("cases"));
$("addAlumniBtn").addEventListener("click", () => openModal("alumni"));
$("addUserBtn").addEventListener("click", () => openModal("users"));

// ========== Modal Open/Edit ===========

function openModal(type, id=null){
  currentType = type;
  currentEditId = id;
  modalForm.innerHTML = "";
  modalTitle.textContent = id ? `Edit ${capitalize(type.slice(0,-1))}` : `Add ${capitalize(type.slice(0,-1))}`;

  let data = null;
  if(id){
    data = getItemById(type, id);
  }

  // Dynamically build form based on type
  switch(type){
    case "tasks":
      modalForm.innerHTML = `
        <label>Title<input type="text" id="input-title" required value="${data ? data.title : ''}"></label>
        <label>Description<textarea id="input-desc">${data ? data.description : ''}</textarea></label>
        <label>Start Date<input type="date" id="input-start" value="${data ? data.startDate : ''}"></label>
        <label>Due Date<input type="date" id="input-due" value="${data ? data.dueDate : ''}"></label>
        <label>Assignee<input type="text" id="input-assignee" value="${data ? data.assignee : ''}"></label>
        <label>Status>
          <select id="input-status">
            <option value="pending" ${data && data.status==="pending" ? "selected" : ""}>Pending</option>
            <option value="completed" ${data && data.status==="completed" ? "selected" : ""}>Completed</option>
          </select>
        </label>
        <label>Priority>
          <select id="input-priority">
            <option value="low" ${data && data.priority==="low" ? "selected" : ""}>Low</option>
            <option value="medium" ${!data || data.priority==="medium" ? "selected" : ""}>Medium</option>
            <option value="high" ${data && data.priority==="high" ? "selected" : ""}>High</option>
          </select>
        </label>
      `;
      break;

    case "events":
      modalForm.innerHTML = `
        <label>Title<input type="text" id="input-title" required value="${data ? data.title : ''}"></label>
        <label>Date<input type="date" id="input-date" required value="${data ? data.date : ''}"></label>
        <label>Location<input type="text" id="input-location" value="${data ? data.location : ''}"></label>
        <label>Participants<input type="text" id="input-participants" value="${data ? data.participants : ''}"></label>
      `;
      break;

    case "contacts":
      modalForm.innerHTML = `
        <label>Name<input type="text" id="input-name" required value="${data ? data.name : ''}"></label>
        <label>Phone<input type="text" id="input-phone" value="${data ? data.phone : ''}"></label>
        <label>Email<input type="email" id="input-email" value="${data ? data.email : ''}"></label>
        <label>Address<input type="text" id="input-address" value="${data ? data.address : ''}"></label>
      `;
      break;

    case "reports":
    case "challenges":
      modalForm.innerHTML = `
        <label>Title<input type="text" id="input-title" required value="${data ? data.title : ''}"></label>
        <label>Date<input type="date" id="input-date" required value="${data ? data.date : ''}"></label>
        <label>Content<textarea id="input-content" required>${data ? data.content : ''}</textarea></label>
      `;
      break;

    case "cases":
      modalForm.innerHTML = `
        <label>Title<input type="text" id="input-title" required value="${data ? data.title : ''}"></label>
        <label>Description<textarea id="input-desc">${data ? data.description : ''}</textarea></label>
        <label>Status>
          <select id="input-status">
            <option value="open" ${data && data.status==="open" ? "selected" : ""}>Open</option>
            <option value="closed" ${data && data.status==="closed" ? "selected" : ""}>Closed</option>
          </select>
        </label>
      `;
      break;

    case "alumni":
      modalForm.innerHTML = `
        <label>Name<input type="text" id="input-name" required value="${data ? data.name : ''}"></label>
        <label>Graduation Year<input type="number" id="input-year" required value="${data ? data.year : ''}"></label>
        <label>Phone<input type="text" id="input-phone" value="${data ? data.phone : ''}"></label>
      `;
      break;

    case "users":
      modalForm.innerHTML = `
        <label>Username<input type="text" id="input-username" required value="${data ? data.username : ''}"></label>
        <label>Password<input type="password" id="input-password" ${id ? '' : 'required'}></label>
        <label>Role
          <select id="input-role">
            <option value="admin" ${data && data.role==="admin" ? "selected" : ""}>Admin</option>
            <option value="pr" ${data && data.role==="pr" ? "selected" : ""}>PR Officer</option>
            <option value="event" ${data && data.role==="event" ? "selected" : ""}>Event Manager</option>
          </select>
        </label>
      `;
      break;
  }
  modal.classList.remove("hidden");
}

function getItemById(type, id){
  switch(type){
    case "tasks": return tasks.find(i=>i.id===id);
    case "events": return events.find(i=>i.id===id);
    case "contacts": return contacts.find(i=>i.id===id);
    case "reports": return reports.find(i=>i.id===id);
    case "challenges": return challenges.find(i=>i.id===id);
    case "cases": return cases.find(i=>i.id===id);
    case "alumni": return alumni.find(i=>i.id===id);
    case "users": return users.find(i=>i.id===id);
  }
}

// ========== Form submit handling ===========

function handleFormSubmit(){
  switch(currentType){
    case "tasks":
      saveTask();
      break;
    case "events":
      saveEvent();
      break;
    case "contacts":
      saveContact();
      break;
    case "reports":
      saveReport();
      break;
    case "challenges":
      saveChallenge();
      break;
    case "cases":
      saveCase();
      break;
    case "alumni":
      saveAlumni();
      break;
    case "users":
      saveUser();
      break;
  }
  closeModal();
  renderAll();
}

// ========== Save functions ===========

function saveTask(){
  const t = {
    id: currentEditId || generateId(),
    title: $("input-title").value.trim(),
    description: $("input-desc").value.trim(),
    startDate: $("input-start").value,
    dueDate: $("input-due").value,
    assignee: $("input-assignee").value.trim(),
    status: $("input-status").value,
    priority: $("input-priority").value
  };
  if(currentEditId){
    const idx = tasks.findIndex(tk=>tk.id===currentEditId);
    tasks[idx] = t;
  } else {
    tasks.push(t);
  }
}

function saveEvent(){
  const e = {
    id: currentEditId || generateId(),
    title: $("input-title").value.trim(),
    date: $("input-date").value,
    location: $("input-location").value.trim(),
    participants: $("input-participants").value.trim()
  };
  if(currentEditId){
    const idx = events.findIndex(ev=>ev.id===currentEditId);
    events[idx] = e;
  } else {
    events.push(e);
  }
}

function saveContact(){
  const c = {
    id: currentEditId || generateId(),
    name: $("input-name").value.trim(),
    phone: $("input-phone").value.trim(),
    email: $("input-email").value.trim(),
    address: $("input-address").value.trim()
  };
  if(currentEditId){
    const idx = contacts.findIndex(ct=>ct.id===currentEditId);
    contacts[idx] = c;
  } else {
    contacts.push(c);
  }
}

function saveReport(){
  const r = {
    id: currentEditId || generateId(),
    title: $("input-title").value.trim(),
    date: $("input-date").value,
    content: $("input-content").value.trim()
  };
  if(currentEditId){
    const idx = reports.findIndex(rp=>rp.id===currentEditId);
    reports[idx] = r;
  } else {
    reports.push(r);
  }
}

function saveChallenge(){
  const ch = {
    id: currentEditId || generateId(),
    title: $("input-title").value.trim(),
    date: $("input-date").value,
    content: $("input-content").value.trim()
  };
  if(currentEditId){
    const idx = challenges.findIndex(chl=>chl.id===currentEditId);
    challenges[idx] = ch;
  } else {
    challenges.push(ch);
  }
}

function saveCase(){
  const c = {
    id: currentEditId || generateId(),
    title: $("input-title").value.trim(),
    description: $("input-desc").value.trim(),
    status: $("input-status").value
  };
  if(currentEditId){
    const idx = cases.findIndex(cs=>cs.id===currentEditId);
    cases[idx] = c;
  } else {
    cases.push(c);
  }
}

function saveAlumni(){
  const a = {
    id: currentEditId || generateId(),
    name: $("input-name").value.trim(),
    year: $("input-year").value,
    phone: $("input-phone").value.trim()
  };
  if(currentEditId){
    const idx = alumni.findIndex(al=>al.id===currentEditId);
    alumni[idx] = a;
  } else {
    alumni.push(a);
  }
}

function saveUser(){
  const u = {
    id: currentEditId || generateId(),
    username: $("input-username").value.trim(),
    password: $("input-password").value,
    role: $("input-role").value
  };
  if(currentEditId){
    const idx = users.findIndex(us=>us.id===currentEditId);
    if(u.password === "") {
      u.password = users[idx].password; // keep old password if not changed
    }
    users[idx] = u;
  } else {
    users.push(u);
  }
}

// ========== Delete function ===========

function deleteItem(type, id){
  if(!confirm("Are you sure you want to delete this item?")) return;
  switch(type){
    case "tasks":
      tasks = tasks.filter(t => t.id !== id);
      break;
    case "events":
      events = events.filter(e => e.id !== id);
      break;
    case "contacts":
      contacts = contacts.filter(c => c.id !== id);
      break;
    case "reports":
      reports = reports.filter(r => r.id !== id);
      break;
    case "challenges":
      challenges = challenges.filter(ch => ch.id !== id);
      break;
    case "cases":
      cases = cases.filter(ca => ca.id !== id);
      break;
    case "alumni":
      alumni = alumni.filter(a => a.id !== id);
      break;
    case "users":
      users = users.filter(u => u.id !== id);
      break;
  }
  renderAll();
}

// ========== Helpers ===========

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== Render all ===========

function renderAll(){
  renderDashboard();
  renderList("tasks");
  renderList("events");
  renderList("contacts");
  renderList("reports");
  renderList("challenges");
  renderList("cases");
  renderList("alumni");
  renderList("users");
}

// Initial render
renderAll();
function renderReports() {
  const reportsList = document.getElementById("reports-list");
  reportsList.innerHTML = "";

  if (tasks.length === 0) {
    reportsList.innerHTML = "<li>No reports available.</li>";
    return;
  }

  tasks.forEach((task) => {
    let li = document.createElement("li");
    li.textContent = `${task.title} - Status: ${task.status} - Assigned to: ${task.assignee}`;
    reportsList.appendChild(li);
  });
}
function generatePDFReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("GAS PR Management System - Task Report", 10, 20);

  doc.setFontSize(12);
  let y = 30;

  if (tasks.length === 0) {
    doc.text("No tasks available.", 10, y);
  } else {
    tasks.forEach((task, i) => {
      const line = `${i + 1}. ${task.title} - ${task.status} - ${task.assignee}`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
  }

  doc.save("pr_tasks_report.pdf");
}
