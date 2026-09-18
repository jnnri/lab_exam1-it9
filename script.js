document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                themeToggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
            } else {
                themeToggleBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
            }
            localStorage.setItem('theme', theme);
        });
    }

    const taskForm = document.getElementById('task-form');
    if (!taskForm) return;

    const taskTitleInput = document.getElementById('task-title');
    const taskDueDateInput = document.getElementById('task-date');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskTableBody = document.getElementById('task-table-body');
    const searchInput = document.getElementById('search-input');
    const clearAllBtn = document.getElementById('clear-all-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editTaskId = null;

    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function updateCounters(filteredTasks) {
        document.getElementById('total-tasks').textContent = tasks.length;
        document.getElementById('pending-tasks').textContent = tasks.filter(t => t.status === 'Pending').length;
        document.getElementById('completed-tasks').textContent = tasks.filter(t => t.status === 'Completed').length;
    }

    function renderTasks() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        taskTableBody.innerHTML = '';

        const displayedTasks = tasks.filter(task => task.title.toLowerCase().includes(query));

        displayedTasks.forEach((task, index) => {
            const tr = document.createElement('tr');
            if (task.status === 'Completed') {
                tr.classList.add('completed-task');
            }

            let priorityBadge = 'bg-secondary';
            if (task.priority === 'High') priorityBadge = 'bg-danger';
            if (task.priority === 'Medium') priorityBadge = 'bg-warning text-dark';
            if (task.priority === 'Low') priorityBadge = 'bg-info text-dark';

            let statusBadge = task.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark';

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${task.title}</td>
                <td>${task.dueDate}</td>
                <td><span class="badge ${priorityBadge}">${task.priority}</span></td>
                <td><span class="badge ${statusBadge}">${task.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-success me-1" onclick="toggleComplete('${task.id}')" title="Mark Done">
                        <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn btn-sm btn-info text-white me-1" onclick="editTask('${task.id}')" title="Edit">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask('${task.id}')" title="Delete">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `;
            taskTableBody.appendChild(tr);
        });

        updateCounters();
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = taskTitleInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const priority = taskPriorityInput.value;

        if (!title || !dueDate) {
            alert('Please fill out both Task Title and Due Date!');
            return;
        }

        if (editTaskId !== null) {
            tasks = tasks.map(task => {
                if (task.id === editTaskId) {
                    return { ...task, title, dueDate, priority };
                }
                return task;
            });
            editTaskId = null;
            document.getElementById('form-submit-btn').textContent = 'Add Task';
        } else {
            const newTask = {
                id: Date.now().toString(),
                title,
                dueDate,
                priority,
                status: 'Pending'
            };
            tasks.push(newTask);
        }

        taskForm.reset();
        saveAndRender();
    });

    window.toggleComplete = (id) => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
            }
            return task;
        });
        saveAndRender();
    };

    window.editTask = (id) => {
        const taskToEdit = tasks.find(task => task.id === id);
        if (taskToEdit) {
            taskTitleInput.value = taskToEdit.title;
            taskDueDateInput.value = taskToEdit.dueDate;
            taskPriorityInput.value = taskToEdit.priority;
            editTaskId = id;
            document.getElementById('form-submit-btn').textContent = 'Update Task';
        }
    };

    window.deleteTask = (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveAndRender();
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', renderTasks);
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL tasks?')) {
                tasks = [];
                saveAndRender();
            }
        });
    }

    renderTasks();
});