const GOOGLE_API = "https://script.google.com/macros/s/AKfycbyILe6A_Jvhqj8AYj6daZFI5yAHBmcnPibsgSklUhD_vNbw8t-Dod02R9fEbZvTvUai/exec";

async function fetchTasks() {
  try {
    const res = await fetch(`${GOOGLE_API}?action=list`);
    const data = await res.json();
    console.log("Tasks from Google Sheets:", data);
    renderTasks(data); // or renderList if you're using that
  } catch (err) {
    console.error("Failed to load tasks:", err);
  }
}

async function addTask(task) {
  const params = new URLSearchParams({
    action: "add",
    id: new Date().getTime(), // unique id
    tittle: task.tittle,
    description: task.description,
    status: task.status,
    assignee: task.assignee,
    "start date": task.startDate,
    "due date": task.dueDate,
    priority: task.priority,
  });

  try {
    await fetch(`${GOOGLE_API}?${params.toString()}`, { method: "POST" });
    fetchTasks(); // Refresh the list
  } catch (err) {
    console.error("Failed to add task:", err);
  }
}
