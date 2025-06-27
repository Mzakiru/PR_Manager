const API_BASE = " https://script.google.com/macros/s/AKfycbx6v8uxBd_CcEuYQzetXxF4oaEiIhkbiYof4nVnRIYyVtTgYqt3C0hvX3Hv2OAAwyV7vg/exec"
// script.js
// --------- LOGIN FUNCTION ----------
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  // You can change this to your own credentials
  if (user === "admin" && pass === "admin") {
    localStorage.setItem("isLoggedIn", "true");
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainSystem").style.display = "block";
  } else {
    alert("Incorrect username or password.");
  }
}

function showSection(id) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// --------- NEWS FUNCTIONS ----------
function saveNews() {
  const news = document.getElementById("newsText").value;
  if (news.trim() === "") return alert("Please enter some news.");

  let newsArray = JSON.parse(localStorage.getItem("news")) || [];
  newsArray.push(news);
  localStorage.setItem("news", JSON.stringify(newsArray));
  document.getElementById("newsText").value = "";
  loadNews();
}

function loadNews() {
  let newsArray = JSON.parse(localStorage.getItem("news")) || [];
  const list = document.getElementById("newsList");
  list.innerHTML = "";
  newsArray.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

// --------- EVENTS FUNCTIONS ----------
function saveEvent() {
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  if (!title || !date) return alert("Please enter both title and date.");

  let events = JSON.parse(localStorage.getItem("events")) || [];
  events.push({ title, date });
  localStorage.setItem("events", JSON.stringify(events));
  document.getElementById("eventTitle").value = "";
  document.getElementById("eventDate").value = "";
  loadEvents();
}

function loadEvents() {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  const list = document.getElementById("eventList");
  list.innerHTML = "";
  events.forEach(event => {
    const li = document.createElement("li");
    li.textContent = `${event.title} - ${event.date}`;
    list.appendChild(li);
  });
}

// Load on start
loadNews();
loadEvents();
// --------- GALLERY FUNCTIONS ----------
function uploadImages() {
  const input = document.getElementById("imageInput");
  const files = input.files;

  if (files.length === 0) {
    alert("Please select at least one image.");
    return;
  }

  let imageGallery = JSON.parse(localStorage.getItem("gallery")) || [];

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      imageGallery.push(e.target.result);
      localStorage.setItem("gallery", JSON.stringify(imageGallery));
      displayGallery();
    };
    reader.readAsDataURL(file);
  });

  input.value = ""; // Reset input
}

function displayGallery() {
  const gallery = JSON.parse(localStorage.getItem("gallery")) || [];
  const galleryDiv = document.getElementById("galleryDisplay");
  galleryDiv.innerHTML = "";

  gallery.forEach(imgData => {
    const img = document.createElement("img");
    img.src = imgData;
    galleryDiv.appendChild(img);
  });
}

// Load gallery on start
displayGallery();
// --------- REPORT GENERATOR ----------
function generateReport() {
  const news = JSON.parse(localStorage.getItem("news")) || [];
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const gallery = JSON.parse(localStorage.getItem("gallery")) || [];

  let report = `
    <h3>PR Summary Report</h3>
    <p><strong>Total News Posts:</strong> ${news.length}</p>
    <ul>${news.map(n => `<li>${n}</li>`).join("")}</ul>

    <p><strong>Total Events:</strong> ${events.length}</p>
    <ul>${events.map(e => `<li>${e.title} - ${e.date}</li>`).join("")}</ul>

    <p><strong>Total Images in Gallery:</strong> ${gallery.length}</p>
  `;

  document.getElementById("reportOutput").innerHTML = report;
}
// --------- PDF EXPORT ----------
async function downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const news = JSON.parse(localStorage.getItem("news")) || [];
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const gallery = JSON.parse(localStorage.getItem("gallery")) || [];

  let y = 10;

  doc.setFontSize(16);
  doc.text("School PR Report", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Total News: ${news.length}`, 10, y);
  y += 8;
  news.forEach((n, i) => {
    doc.text(`- ${n}`, 12, y);
    y += 6;
  });

  y += 4;
  doc.text(`Total Events: ${events.length}`, 10, y);
  y += 8;
  events.forEach(e => {
    doc.text(`- ${e.title} on ${e.date}`, 12, y);
    y += 6;
  });

  y += 4;
  doc.text(`Total Images: ${gallery.length}`, 10, y);

  doc.save("PR_Report.pdf");
}
// --------- AUTO CHECK IF LOGGED IN ----------
window.onload = function () {
  if (localStorage.getItem("isLoggedIn") === "true") {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainSystem").style.display = "block";
  } else {
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("mainSystem").style.display = "none";
  }

  loadNews();
  loadEvents();
  displayGallery();
};
function saveNews() {
  const newsText = document.getElementById("newsText").value;

  if (!newsText) {
    alert("Please write something!");
    return;
  }

  fetch(API_BASE, {
    method: "POST",
    body: JSON.stringify({
      content: newsText,
      type: "News"
    })
  })
  .then(() => {
    document.getElementById("newsText").value = ""; // Clear input box
    loadNews(); // Reload news list after saving
  })
  .catch(err => {
    alert("Failed to save news!");
    console.error(err);
  });
}
function loadNews() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(data => {
      const newsList = document.getElementById("newsList");
      newsList.innerHTML = ""; // Clear existing news items

      // Filter data to only include items where type === "News"
      const newsItems = data.filter(item => item.type === "News");

      // Add each news item as a list element
      newsItems.forEach(n => {
        const li = document.createElement("li");
        li.innerText = `${n.content} (${new Date(n.date).toLocaleDateString()})`;
        newsList.appendChild(li);
      });
    })
    .catch(err => {
      alert("Failed to load news!");
      console.error(err);
    });
}
