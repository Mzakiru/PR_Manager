// Data structure to hold tasks
let tasks = [
  // Sample preset tasks
  {
    id: generateId(),
    title: "Communicate with parents",
    description: "Send weekly updates and notices",
    priority: "High",
    dueDate: "2025-07-05",
    completed: false,
  },
  {
    id: generateId(),
    title: "Organize school events",
    description: "Coordinate graduation and parents' day",
    priority: "Medium",
    dueDate: "2025-07-20",
    completed: false,
  },
  {
    id: generateId(),
    title: "Prepare press releases",
    description: "Write and distribute to local media",
    priority: "High",
    dueDate: "2025-06-30",
    completed: true,
  },
];

const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "all";

// Utility function to generate unique ID
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Render tasks based on filter and search
function renderTasks() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  taskList.innerHTML = "";

  let filteredTasks = tasks.filter((task) => {
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "pending") return !task.completed;
    return true;
  });

  filteredTasks = filteredTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm)
  );

  if (filteredTasks.length === 0) {
    taskList.innerHTML = "<li class='no-tasks'>No tasks found.</li>";
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-item");
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <div class="task-header">
        <h3 class="task-title">${task.title}</h3>
        <span class="task-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      <p class="task-desc">${task.description || ""}</p>
      <div class="task-footer">
        <span>Due: ${task.dueDate}</span>
        <div class="task-actions">
          <button title="Toggle complete" onclick="toggleComplete('${task.id}')">
            ${task.completed ? "🔄" : "✔️"}
          </button>
          <button title="Edit task" onclick="editTask('${task.id}')">✏️</button>
          <button title="Delete task" onclick="deleteTask('${task.id}')">🗑️</button>
        </div>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Add new task handler
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-desc").value.trim();
  const priority = document.getElementById("task-priority").value;
  const dueDate = document.getElementById("task-due-date").value;

  if (!title || !priority || !dueDate) {
    alert("Please fill in all required fields.");
    return;
  }

  tasks.push({
    id: generateId(),
    title,
    description,
    priority,
    dueDate,
    completed: false,
  });

  taskForm.reset();
  renderTasks();
});

// Toggle complete status
function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
  }
}

// Delete task
function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id);
    renderTasks();
  }
}

// Edit task
function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const newTitle = prompt("Edit Task Title:", task.title);
  if (newTitle === null) return; // cancel

  const newDesc = prompt("Edit Task Description:", task.description);
  if (newDesc === null) return;

  const newPriority = prompt(
    "Edit Priority (Low, Medium, High):",
    task.priority
  );
  if (
    newPriority === null ||
    !["low", "medium", "high"].includes(newPriority.toLowerCase())
  ) {
    alert("Invalid priority. Task not updated.");
    return;
  }

  const newDueDate = prompt("Edit Due Date (YYYY-MM-DD):", task.dueDate);
  if (newDueDate === null || !/^\d{4}-\d{2}-\d{2}$/.test(newDueDate)) {
    alert("Invalid date format. Task not updated.");
    return;
  }

  task.title = newTitle.trim();
  task.description = newDesc.trim();
  task.priority = newPriority.charAt(0).toUpperCase() + newPriority.slice(1).toLowerCase();
  task.dueDate = newDueDate;

  renderTasks();
}

// Filter buttons
filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTasks();
  })
);

// Search input
searchInput.addEventListener("input", () => {
  renderTasks();
});

// Initial render
renderTasks();
