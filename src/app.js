(function () {
  const STORAGE_KEY = "desktop-schedule-widget.tasks.v1";
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
  const WHEEL_THRESHOLD = 34;

  const state = {
    view: "todo",
    isAddOpen: false,
    tasks: []
  };

  const elements = {
    widget: document.getElementById("widget"),
    todayLabel: document.getElementById("todayLabel"),
    contentWindow: document.getElementById("contentWindow"),
    quickAdd: document.getElementById("quickAdd"),
    openAddButton: document.getElementById("openAddButton"),
    addPanel: document.getElementById("addPanel"),
    taskName: document.getElementById("taskNameInput"),
    deadline: document.getElementById("deadlineInput"),
    addButton: document.getElementById("addTaskButton"),
    cancelAddButton: document.getElementById("cancelAddButton"),
    todoList: document.getElementById("todoList"),
    completedList: document.getElementById("completedList"),
    hint: document.getElementById("switchHint"),
    pin: document.getElementById("pinButton"),
    minimize: document.getElementById("minimizeButton"),
    close: document.getElementById("closeButton")
  };

  const sampleTasks = [
    {
      id: crypto.randomUUID(),
      name: "Write project report",
      deadline: toInputValue(addHours(new Date(), 5)),
      completedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: "Review algorithms",
      deadline: toInputValue(addHours(new Date(), 22)),
      completedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: "Book dentist",
      deadline: toInputValue(addDays(new Date(), 3)),
      completedAt: null,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: "Reply emails",
      deadline: toInputValue(addHours(new Date(), -3)),
      completedAt: addHours(new Date(), -1).toISOString(),
      createdAt: addDays(new Date(), -1).toISOString()
    }
  ];

  initialize();

  function initialize() {
    state.tasks = loadTasks();
    cleanupCompleted();
    setDefaultDeadline();
    bindEvents();
    render();
  }

  function bindEvents() {
    elements.openAddButton.addEventListener("click", openAddPanel);
    elements.cancelAddButton.addEventListener("click", closeAddPanel);
    elements.addPanel.addEventListener("submit", (event) => {
      event.preventDefault();
      addTask();
    });
    elements.taskName.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAddPanel();
    });
    elements.hint.addEventListener("click", toggleView);
    elements.widget.addEventListener("wheel", handleWheel, { passive: false });
    elements.contentWindow.addEventListener("touchstart", handleTouchStart, { passive: true });
    elements.contentWindow.addEventListener("touchend", handleTouchEnd, { passive: true });

    elements.pin.addEventListener("click", async () => {
      if (!window.scheduleWindow) return;
      const isPinned = await window.scheduleWindow.toggleAlwaysOnTop();
      elements.pin.classList.toggle("is-active", isPinned);
    });
    elements.minimize.addEventListener("click", () => window.scheduleWindow?.minimize());
    elements.close.addEventListener("click", () => window.scheduleWindow?.close());
  }

  function openAddPanel() {
    if (state.view !== "todo") setView("todo");
    state.isAddOpen = true;
    elements.quickAdd.classList.add("is-open");
    elements.addPanel.setAttribute("aria-hidden", "false");
    setDefaultDeadline();
    requestAnimationFrame(() => elements.taskName.focus());
  }

  function closeAddPanel() {
    state.isAddOpen = false;
    elements.quickAdd.classList.remove("is-open");
    elements.addPanel.setAttribute("aria-hidden", "true");
    elements.taskName.value = "";
  }

  function addTask() {
    const name = elements.taskName.value.trim();
    const deadline = elements.deadline.value;
    if (!name || !deadline) return;

    state.tasks.push({
      id: crypto.randomUUID(),
      name,
      deadline,
      completedAt: null,
      createdAt: new Date().toISOString()
    });

    persist();
    closeAddPanel();
    setView("todo");
    renderLists();
  }

  function toggleTask(id) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;

    task.completedAt = task.completedAt ? null : new Date().toISOString();
    persist();
    renderLists();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter((item) => item.id !== id);
    persist();
    renderLists();
  }

  function cleanupCompleted() {
    const now = Date.now();
    const before = state.tasks.length;
    state.tasks = state.tasks.filter((task) => {
      if (!task.completedAt) return true;
      return now - new Date(task.completedAt).getTime() < FIVE_DAYS_MS;
    });
    if (state.tasks.length !== before) persist();
  }

  function render() {
    elements.todayLabel.textContent = formatToday();
    renderViewState();
    renderLists();
  }

  function renderViewState() {
    const isCompletedView = state.view === "completed";
    elements.widget.classList.toggle("is-completed", isCompletedView);
    elements.hint.textContent = isCompletedView ? "↓ Todo" : "↑ Completed";
    elements.quickAdd.style.display = isCompletedView ? "none" : "flex";
    if (isCompletedView && state.isAddOpen) closeAddPanel();
  }

  function renderLists() {
    cleanupCompleted();
    renderTaskList(elements.todoList, getTodoTasks(), false);
    renderTaskList(elements.completedList, getCompletedTasks(), true);
  }

  function renderTaskList(container, tasks, isCompletedView) {
    container.textContent = "";

    if (tasks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = isCompletedView
        ? "No completed tasks yet."
        : "No todo tasks. Add one when you need it.";
      container.appendChild(empty);
      return;
    }

    for (const task of tasks) {
      container.appendChild(createTaskElement(task));
    }
  }

  function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.classList.toggle("is-completed", Boolean(task.completedAt));
    item.classList.toggle("is-overdue", !task.completedAt && isDueTodayOrEarlier(task.deadline));

    const circleButton = document.createElement("button");
    circleButton.className = "circle-button";
    circleButton.type = "button";
    circleButton.title = task.completedAt ? "Mark as todo" : "Mark as completed";
    circleButton.addEventListener("click", () => toggleTask(task.id));

    const circle = document.createElement("span");
    circle.className = "circle";
    circleButton.appendChild(circle);

    const copy = document.createElement("div");
    copy.className = "task-copy";

    const name = document.createElement("div");
    name.className = "task-name";
    name.textContent = task.name;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = task.completedAt
      ? `Completed ${formatCompletedTime(task.completedAt)}`
      : formatDeadline(task.deadline);

    copy.append(name, meta);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.title = "Delete";
    deleteButton.innerHTML = "&times;";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(circleButton, copy, deleteButton);
    return item;
  }

  function getTodoTasks() {
    return state.tasks
      .filter((task) => !task.completedAt)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  function getCompletedTasks() {
    return state.tasks
      .filter((task) => task.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }

  function setView(view) {
    if (state.view === view) return;
    state.view = view;
    renderViewState();
  }

  function toggleView() {
    setView(state.view === "todo" ? "completed" : "todo");
  }

  function handleWheel(event) {
    const isInsideForm = elements.addPanel.contains(event.target);
    if (isInsideForm) return;

    if (event.deltaY < -WHEEL_THRESHOLD) {
      event.preventDefault();
      setView("completed");
    } else if (event.deltaY > WHEEL_THRESHOLD) {
      event.preventDefault();
      setView("todo");
    }
  }

  let touchStartY = 0;

  function handleTouchStart(event) {
    touchStartY = event.changedTouches[0].clientY;
  }

  function handleTouchEnd(event) {
    const delta = event.changedTouches[0].clientY - touchStartY;
    if (delta < -42) setView("completed");
    if (delta > 42) setView("todo");
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : sampleTasks;
    } catch {
      return sampleTasks;
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }

  function setDefaultDeadline() {
    elements.deadline.value = toInputValue(addHours(new Date(), 1));
  }

  function formatToday() {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }).format(new Date());
  }

  function formatDeadline(value) {
    const date = new Date(value);
    const today = startOfDay(new Date());
    const target = startOfDay(date);
    const dayDiff = Math.round((target - today) / (24 * 60 * 60 * 1000));
    const time = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);

    if (dayDiff === 0) return `Today - ${time}`;
    if (dayDiff === 1) return `Tomorrow - ${time}`;
    if (dayDiff === -1) return `Yesterday - ${time}`;

    const day = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(date);
    return `${day} - ${time}`;
  }

  function formatCompletedTime(value) {
    const date = new Date(value);
    const today = startOfDay(new Date());
    const target = startOfDay(date);
    const dayDiff = Math.round((target - today) / (24 * 60 * 60 * 1000));

    if (dayDiff === 0) {
      const time = new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(date);
      return `Today ${time}`;
    }

    if (dayDiff === -1) return "Yesterday";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function toInputValue(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function isDueTodayOrEarlier(value) {
    return startOfDay(new Date(value)) <= startOfDay(new Date());
  }
})();
