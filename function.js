// ===============PASSWORD SHOW / HIDE================//

function togglePassword() {

    const password = document.getElementById("password");

    if (!password) {
        return;
    }

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}


// ===============PAGE SETUP================//

document.addEventListener("DOMContentLoaded", function () {

    setupLogin();
    setupAddTask();
    setupMainPage();
    setupLogout();

});


// ===============LOGIN================//

function setupLogin() {

    const loginButton =
        document.querySelector(".login-button");

    if (!loginButton) {
        return;
    }


    function login() {

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const correctUsername = "Jeera";
        const correctPassword = "12345";

        if (username === "" || password === "") {

            alert("Please enter your username and password.");

            return;
        }

        if (
            username === correctUsername &&
            password === correctPassword
        ) {

            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("username", username);

            window.location.href = "mainPage.html";

        } else {

            alert("Incorrect username or password.");

        }

    }


    loginButton.addEventListener("click", login);

    document.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            login();
        }

    });

}


// ===============TASK STORAGE================//

function getTasks() {

    const tasks = localStorage.getItem("tasks");

    if (tasks) {
        return JSON.parse(tasks);
    }

    return [];

}


function saveTasks(tasks) {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


// ===============ADD NEW TASK================//

function setupAddTask() {

    const addButton = document.querySelector(".modal-buttons .add-button");

    if (!addButton) {
        return;
    }

    const quickTask = localStorage.getItem("newTask");

    if (quickTask) {

        const description = document.getElementById("task-description");

        if (description) {
            description.value = quickTask;
        }

        localStorage.removeItem("newTask");

    }


    addButton.addEventListener("click", function () {

        const description = document.getElementById("task-description").value.trim();
        const dueDate = document.getElementById("task-due-date").value;
        const priority = document.getElementById("task-priority").value;
        const category = document.getElementById("task-category").value;
        const recurring = document.getElementById("task-recurring").value;
        const reminder = document.getElementById("task-reminder").checked;

        if (description === "") {

            alert("Please enter a task.");

            return;
        }


        const tasks = getTasks();

        const newTask = {

            id: Date.now(),
            description: description,
            dueDate: dueDate,
            priority: priority,
            category: category,
            recurring: recurring,
            reminder: reminder,
            completed: false

        };


        tasks.push(newTask);
        saveTasks(tasks);
        alert("Task added successfully!");
        window.location.href = "mainPage.html";

    });


    const cancelButton = document.querySelector(".cancel-button");


    if (cancelButton) {

        cancelButton.addEventListener("click", function () {
            window.location.href = "mainPage.html";

        });

    }


    const closeButton = document.querySelector(".close-button");


    if (closeButton) {

        closeButton.addEventListener("click", function () {
            window.location.href = "mainPage.html";

        });

    }

}


// ===============MAIN PAGE================//

function setupMainPage() {

    const app = document.querySelector(".app");

    if (!app) {
        return;
    }

    updateDate();


    const username = localStorage.getItem("username");
    const welcomeMessage = document.getElementById("welcome-message");


    if (welcomeMessage && username) {

        welcomeMessage.textContent =
            "Welcome back, " + username + "! 👋";

    }


    createDefaultTasks();
    displayTasks();
    setupMainButtons();
    setupFilters();
    setupCategories();
    setupSearch();
    setupHeaderButtons();
    setupOverdue();

}


// ===============DEFAULT TASKS================//

function createDefaultTasks() {

    if (localStorage.getItem("tasks")) {
        return;
    }


    const tasks = [

        {
            id: 1,
            description: "Finish IT Assignment",
            dueDate: "2026-09-14",
            priority: "high",
            category: "study",
            recurring: "none",
            reminder: false,
            completed: false
        },

        {
            id: 2,
            description: "Study for Exam",
            dueDate: "2026-09-15",
            priority: "high",
            category: "study",
            recurring: "none",
            reminder: false,
            completed: false
        }

    ];


    saveTasks(tasks);

}


// ===============DISPLAY TASKS================//

function displayTasks(taskList = null) {

    const tasksContainer = document.querySelector(".tasks");

    if (!tasksContainer) {
        return;
    }


    const tasks =
        taskList !== null
            ? taskList
            : getTasks();


    tasksContainer
        .querySelectorAll(".task")
        .forEach(function (task) {

            task.remove();

        });


    tasks.forEach(function (task) {

        const article =
            document.createElement("article");


        article.className = "task";


        if (task.completed) {

            article.classList.add(
                "completed-task"
            );

        }

        if (isOverdue(task)) {

            article.classList.add(
                "overdue-task"
            );

        }


        article.innerHTML = `

            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? "checked" : ""}
            >

            <div class="task-info">

                <strong>${task.description}</strong>

                <p class="due-date">
                    ${formatDate(task.dueDate)}
                </p>

            </div>

            <span class="category-badge ${task.category}">
                ${task.category.toUpperCase()}
            </span>

            <span class="priority-badge ${task.priority}">
                ${task.priority.toUpperCase()}
            </span>

          <div class="task-actions">

            <button class="edit-button" aria-label="Edit task">✎</button>
            <button class="delete-button" aria-label="Delete task">🗑</button>
        
        </div>

        `;


        article
            .querySelector(".task-checkbox")
            .addEventListener("change", function () {

                toggleTask(task.id);

            });


        article
            .querySelector(".edit-button")
            .addEventListener("click", function () {

                editTask(task.id);

            });


        article
            .querySelector(".delete-button")
            .addEventListener("click", function () {

                deleteTask(task.id);

            });


        tasksContainer.appendChild(article);

    });


    updateSummary(getTasks());
    updateCounts();
    updateOverdueCount();

}


// ===============UPDATE COUNTS================//

function updateCounts() {

    const tasks = getTasks();


    const total = tasks.length;

    const completed =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    const pending = total - completed;


    document.querySelectorAll(".filter")
        .forEach(function (button) {

            const text =
                button.textContent
                    .trim()
                    .toLowerCase();

            const number =
                button.querySelector("span");


            if (!number) {
                return;
            }

            if (text.startsWith("all")) {
                number.textContent = total;

            } else if (text.startsWith("pending")) {
                number.textContent = pending;

            } else if (text.startsWith("completed")) {
                number.textContent = completed;

            }

        });


    document.querySelectorAll(".category")
        .forEach(function (button) {

            const spans = button.querySelectorAll("span");

            if (spans.length < 2) {
                return;
            }

            const categoryName =
                spans[0].textContent
                    .trim()
                    .toLowerCase();


            if (categoryName === "all") {
                spans[1].textContent = total;

            } else {

                const count =
                    tasks.filter(function (task) {

                        return task.category === categoryName;

                    }).length;


                spans[1].textContent = count;

            }

        });

}

// ===============CHECK OVERDUE================//

function isOverdue(task) {

    if (!task.dueDate || task.completed) {
        return false;
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const dueDate =
        new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;

}


// ===============UPDATE OVERDUE COUNT================//

function updateOverdueCount() {

    const button =
        document.querySelector(".overdue");


    if (!button) {
        return;
    }


    const count =
        getTasks().filter(function (task) {
            return isOverdue(task);

        }).length;


    if (count === 0) {
        button.style.display = "none";

    } else {
        button.style.display = "block";

        if (count === 1) {

            button.textContent =
                "⚠ 1 overdue task";

        } else {

            button.textContent =
                "⚠ " + count + " overdue tasks";

        }

    }

}


// ===============OVERDUE TASKS================//

function setupOverdue() {

    const overdueButton =
        document.querySelector(".overdue");


    if (!overdueButton) {
        return;
    }


    overdueButton.addEventListener("click", function () {

        const overdueTasks =
            getTasks().filter(function (task) {

                return isOverdue(task);

            });


        displayTasks(overdueTasks);

    });

}


// ===============ADD TASK BUTTON================//

function setupMainButtons() {

    const addButton =
        document.querySelector(".add-task .add-button");


    if (!addButton) {
        return;
    }

    addButton.addEventListener("click", function () {

        const input =
            document.querySelector(
                ".task-input input"
            );

        if (input && input.value.trim() !== "") {

            localStorage.setItem(
                "newTask",
                input.value.trim()
            );

        }

        window.location.href =
            "addNewtask.html";

    });

}


// ===============COMPLETE TASK================//

function toggleTask(id) {
    const tasks = getTasks();

    tasks.forEach(function (task) {

        if (task.id === id) {

            task.completed =
                !task.completed;

        }

    });


    saveTasks(tasks);
    displayTasks();

}


// ===============DELETE TASK================//

function deleteTask(id) {

    const answer =
        confirm("Delete this task?");

    if (!answer) {
        return;
    }


    const tasks =
        getTasks().filter(function (task) {

            return task.id !== id;

        });


    saveTasks(tasks);
    displayTasks();

}


// ===============EDIT TASK================//

function editTask(id) {

    const tasks = getTasks();

    const task =
        tasks.find(function (item) {

            return item.id === id;

        });


    if (!task) {
        return;
    }


    const newDescription =
        prompt(
            "Enter new task description:",
            task.description
        );


    if (
        newDescription === null ||
        newDescription.trim() === ""
    ) {

        return;

    }


    task.description =
        newDescription.trim();


    saveTasks(tasks);
    displayTasks();

}


// ===============TASK FILTERS================//

function setupFilters() {

    document.querySelectorAll(".filter")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                document.querySelectorAll(".filter")
                    .forEach(function (item) {

                        item.classList.remove("active");

                    });


                button.classList.add("active");


                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();


                const tasks =
                    getTasks();


                if (text.startsWith("pending")) {

                    displayTasks(
                        tasks.filter(function (task) {

                            return !task.completed;

                        })
                    );

                } else if (text.startsWith("completed")) {

                    displayTasks(
                        tasks.filter(function (task) {

                            return task.completed;

                        })
                    );

                } else {

                    displayTasks(tasks);

                }

            });

        });

}


// ===============CATEGORIES================//

function setupCategories() {

    document.querySelectorAll(".category")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                document.querySelectorAll(".category")
                    .forEach(function (item) {

                        item.classList.remove("active");

                    });


                button.classList.add("active");


                const categoryName =
                    button
                        .querySelector("span")
                        .textContent
                        .trim()
                        .toLowerCase();


                const tasks =
                    getTasks();


                if (categoryName === "all") {

                    displayTasks(tasks);

                } else {

                    displayTasks(
                        tasks.filter(function (task) {

                            return task.category === categoryName;

                        })
                    );

                }

            });

        });

}


// ===============SEARCH================//

function setupSearch() {

    const search =
        document.querySelector(
            '.header-actions input[type="search"]'
        );


    if (!search) {
        return;
    }


    search.addEventListener("input", function () {

        const searchText =
            search.value
                .trim()
                .toLowerCase();


        const results =
            getTasks().filter(function (task) {

                return task.description
                    .toLowerCase()
                    .includes(searchText);

            });


        displayTasks(results);

    });

}


// ===============SUMMARY================//

function updateSummary(tasks) {

    const total =
        tasks.length;


    const completed =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    const pending = total - completed;
    const totalNumber = document.querySelector(".blue-number");
    const completedNumber = document.querySelector(".green-number");
    const pendingNumber = document.querySelector(".yellow-number");


    if (totalNumber) {
        totalNumber.textContent = total;
    }


    if (completedNumber) {
        completedNumber.textContent = completed;
    }


    if (pendingNumber) {
        pendingNumber.textContent = pending;
    }


    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-header span");
    const progressDescription = document.querySelector(".progress-card p");


    if (progressFill) {

        progressFill.style.width =
            progress + "%";

    }

    if (progressText) {

        progressText.textContent =
            progress + "%";

    }

    if (progressDescription) {

        progressDescription.textContent =
            completed +
            " of " +
            total +
            " tasks completed";

    }

}


// ===============DATE FORMAT================//

function formatDate(date) {

    if (!date) {
        return "No due date";
    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {
        return date;
    }


    const months = [

        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"

    ];


    return (
        months[Number(parts[1]) - 1] +
        " " +
        Number(parts[2]) +
        ", " +
        parts[0]
    );

}


// ===============CURRENT DATE================//

function updateDate() {

    const dateElement =
        document.getElementById("current-date");


    if (!dateElement) {
        return;
    }


    const today = new Date();


    const date =
        today.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );


    const day =
        today.toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );


    dateElement.textContent =
        date + " · " + day;

}


// ===============PROFILE BUTTON================//

function setupHeaderButtons() {

    const notification = document.querySelector(".notification");
    const profile = document.querySelector(".profile");


    if (notification) {

        notification.addEventListener("click", function () {

            alert("You have no new notifications.");

        });

    }


    if (profile) {

        profile.addEventListener("click", function () {

            window.location.href =
                "userProfile.html";

        });

    }

}


// ===============LOG OUT================//

function setupLogout() {

    const logoutButton =
        document.getElementById("logout-button");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener("click", function () {

        const confirmLogout =
            confirm("Are you sure you want to log out?");


        if (!confirmLogout) {
            return;
        }

        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");

        window.location.href =
            "logIn.html";

    });

}
