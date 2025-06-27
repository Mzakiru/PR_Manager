const API_BASE = "https://script.google.com/macros/s/AKfycbxex6yKiCyPD_Zac3xL-dU_BC7hqHnL5QrN7ebuprov/dev";

// ---------- LOGIN FUNCTION ----------
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "admin") {
    localStorage.setItem("isLoggedIn", "true");
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainSystem").style.display = "block";
  } else {
    alert("Incorrect username or password.");
  }
}

// ---------- SECTION DISPLAY ----------
function showSection(id) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ---------- NEWS FUNCTIONS ----------
function saveNews() {
  const newsText = document.getElementById("newsText").value.trim();
  if (!newsText) return alert("Please write something!");

  fetch(API_BASE, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content: newsText, type: "News"})
  })
  .then(() => {
    document.getElementById("newsText").value = "";
    loadNews();
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
      newsList.innerHTML = "";
      const newsItems = data.filter(item => item.type === "News");
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

// ---------- EVENTS FUNCTIONS ----------
function saveEvent() {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  if (!title || !date) return alert("Please enter both title and date.");

  fetch(API_BASE, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content: title, type: "Event", date})
  })
  .then(() => {
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
    loadEvents();
  })
  .catch(err => {
    alert("Failed to save event!");
    console.error(err);
  });
}

function loadEvents() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(data => {
      const eventList = document.getElementById("eventList");
      eventList.innerHTML = "";
      const events = data.filter(item => item.type === "Event");
      events.forEach(e => {
        const li = document.createElement("li");
        li.innerText = `${e.content} - ${new Date(e.date).toLocaleDateString()}`;
        eventList.appendChild(li);
      });
    })
    .catch(err => {
      alert("Failed to load events!");
      console.error(err);
    });
}

// ---------- GALLERY FUNCTIONS ----------
function uploadImages() {
  const input = document.getElementById("imageInput");
  const files = input.files;

  if (files.length === 0) {
    alert("Please select at least one image.");
    return;
  }

  // We'll upload images one by one as base64 strings
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      fetch(API_BASE, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({content: e.target.result, type: "GalleryImage"})
      })
      .then(() => {
        loadGallery();
      })
      .catch(err => {
        alert("Failed to upload image!");
        console.error(err);
      });
    };
    reader.readAsDataURL(file);
  });

  input.value = ""; // reset input
}

function loadGallery() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(data => {
      const galleryDiv = document.getElementById("galleryDisplay");
      galleryDiv.innerHTML = "";
      const images = data.filter(item => item.type === "GalleryImage");
      images.forEach(img => {
        const image = document.createElement("img");
        image.src = img.content;
        image.style.width = "120px";
        image.style.height = "auto";
        image.style.borderRadius = "8px";
        galleryDiv.appendChild(image);
      });
    })
    .catch(err => {
      alert("Failed to load gallery!");
      console.error(err);
    });
}

// ---------- PRESS RELEASES FUNCTIONS ----------
function savePressRelease() {
  const text = document.getElementById("pressReleaseText").value.trim();
  if (!text) return alert("Please write a press release!");

  fetch(API_BASE, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content: text, type: "PressRelease"})
  })
  .then(() => {
    document.getElementById("pressReleaseText").value = "";
    loadPressReleases();
  })
  .catch(err => {
    alert("Failed to save press release!");
    console.error(err);
  });
}

function loadPressReleases() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("pressReleaseList");
      list.innerHTML = "";
      const prs = data.filter(item => item.type === "PressRelease");
      prs.forEach(pr => {
        const li = document.createElement("li");
        li.innerText = `${pr.content} (${new Date(pr.date).toLocaleDateString()})`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      alert("Failed to load press releases!");
      console.error(err);
    });
}

// ---------- MEDIA CONTACTS FUNCTIONS ----------
function saveMediaContact() {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  if (!name || !email || !phone) return alert("Please fill all contact fields.");

  // Save as JSON string in content, and type MediaContact
  const contactContent = JSON.stringify({name, email, phone});

  fetch(API_BASE, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content: contactContent, type: "MediaContact"})
  })
  .then(() => {
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactPhone").value = "";
    loadMediaContacts();
  })
  .catch(err => {
    alert("Failed to save media contact!");
    console.error(err);
  });
}

function loadMediaContacts() {
  fetch(API_BASE)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("mediaContactList");
      list.innerHTML = "";
      const contacts = data.filter(item => item.type === "MediaContact");
      contacts.forEach(c => {
        const li = document.createElement("li");
        try {
          const contact = JSON.parse(c.content);
          li.innerText = `${contact.name} — Email: ${contact.email} — Phone: ${contact.phone}`;
        } catch {
          li.innerText = c.content; // fallback plain text
        }
        list.appendChild(li);
      });
    })
    .catch(err => {
      alert("Failed to load media contacts!");
      console.error(err);
    });
}

// ---------- REPORT GENERATOR ----------
function generateReport() {
  Promise.all([fetch(API_BASE).then(res => res.json())]).then(([data]) => {
    const news = data.filter(item => item.type === "News");
    const events = data.filter(item => item.type === "Event");
    const gallery = data.filter(item => item.type === "GalleryImage");
    const pressReleases = data.filter(item => item.type === "PressRelease");
    const mediaContacts = data.filter(item => item.type === "MediaContact");

    let report = `
      <h3>PR Summary Report</h3>
      <p><strong>Total News Posts:</strong> ${news.length}</p>
      <ul>${news.map(n => `<li>${n.content}</li>`).join("")}</ul>

      <p><strong>Total Events:</strong> ${events.length}</p>
      <ul>${events.map(e => `<li>${e.content} - ${new Date(e.date).toLocaleDateString()}</li>`).join("")}</ul>

      <p><strong>Total Images in Gallery:</strong> ${gallery.length}</p>

      <p><strong>Total Press Releases:</strong> ${pressReleases.length}</p>
      <ul>${pressReleases.map(pr => `<li>${pr.content}</li>`).join("")}</ul>

      <p><strong>Total Media Contacts:</strong> ${mediaContacts.length}</p>
      <ul>${mediaContacts.map(mc => {
        try {
          const contact = JSON.parse(mc.content);
          return `<li>${contact.name} — Email: ${contact.email} — Phone: ${contact.phone}</li>`;
        } catch {
          return `<li>${mc.content}</li>`;
        }
      }).join("")}</ul>
    `;

    document.getElementById("reportOutput").innerHTML = report;
  }).catch(err => {
    alert("Failed to generate report!");
    console.error(err);
  });
}

// ---------- PDF EXPORT ----------
async function downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const data = await fetch(API_BASE).then(res => res.json());
  const news = data.filter(item => item.type === "News");
  const events = data.filter(item => item.type === "Event");
  const gallery = data.filter(item => item.type === "GalleryImage");
  const pressReleases = data.filter(item => item.type === "PressRelease");
  const mediaContacts = data.filter(item => item.type === "MediaContact");

  let y = 10;

  doc.setFontSize(16);
  doc.text("School PR Report", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Total News: ${news.length}`, 10, y);
  y += 8;
  news.forEach((n) => {
    doc.text(`- ${n.content}`, 12, y);
    y += 6;
  });

  y += 4;
  doc.text(`Total Events: ${events.length}`, 10, y);
  y += 8;
  events.forEach(e => {
    doc.text(`- ${e.content} on ${new Date(e.date).toLocaleDateString()}`, 12, y);
    y += 6;
  });

  y += 4;
  doc.text(`Total Images: ${gallery.length}`, 10, y);

  y += 8;
  doc.text(`Total Press Releases: ${pressReleases.length}`, 10, y);
  y += 8;
  pressReleases.forEach(pr => {
    doc.text(`- ${pr.content}`, 12, y);
    y += 6;
  });

  y += 4;
  doc.text(`Total Media Contacts: ${mediaContacts.length}`, 10, y);
  y += 8;
  mediaContacts.forEach(mc => {
    try {
      const c = JSON.parse(mc.content);
      doc.text(`- ${c.name}, Email: ${c.email}, Phone: ${c.phone}`, 12, y);
    } catch {
      doc.text(`- ${mc.content}`, 12, y);
    }
    y += 6;
  });

  doc.save("PR_Report.pdf");
}

// ---------- AUTO CHECK IF LOGGED IN AND LOAD ----------
window.onload = function () {
  if (localStorage.getItem("isLoggedIn") === "true") {
    document.getElementById("loginPage")?.style.display = "none";
    document.getElementById("mainSystem")?.style.display = "block";
  } else {
    document.getElementById("loginPage")?.style.display = "block";
    document.getElementById("mainSystem")?.style.display = "none";
  }
  loadNews();
  loadEvents();
  loadGallery();
  loadPressReleases();
  loadMediaContacts();
};
