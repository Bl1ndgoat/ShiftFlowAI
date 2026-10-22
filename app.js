/*
===========================================================
ShiftFlow AI v2
app.js

Application Controller

Coordinates:
- Store
- UI
- User Interaction

Author: Gemini 3 Flash
===========================================================
*/

import store from "./store.js";
import { initUI, showPage, toast } from "./ui.js";
import { generateId, debounce, generateHandoverReport, getCurrentShift } from "./utils.js";
import { taskCard, timelineItem, emptyState } from "./components.js";


// ==========================================================
// APPLICATION STATE
// ==========================================================
const App = {

    currentPage: "dashboardPage",

    initialized: false,

    session: {

        employee: "",

        department: "Front Office",

        shift: "",

        loginTime: null,

        active: false

    }

};

// ==========================================================
// DOM CACHE
// ==========================================================
const dom = {
    navButtons: document.querySelectorAll(".nav-item"),
    fab: document.getElementById("fab"),
    fabMenu: document.getElementById("fabMenu"),
    taskSearch: document.getElementById("taskSearch"),
    tasksContainer: document.getElementById("tasksContainer"),
    dashboardTasks: document.getElementById("dashboardTasks"),
    timelinePreview: document.getElementById("timelinePreview"),
    startShiftPage: document.getElementById("startShiftPage"),
    topBar: document.getElementById("topBar"),
    mainContent: document.getElementById("mainContent"),
    bottomNav: document.getElementById("bottomNav"),
    startShiftBtn: document.getElementById("startShiftBtn")
};


// ==========================================================
// INJECT CUSTOM STYLES
// ==========================================================
const injectCustomStyles = () => {
    const styleId = "shiftflow-custom-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
        /* Bottom Sheet Backdrop */
        .bottom-sheet-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(4px);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .bottom-sheet-backdrop.open {
            opacity: 1;
            visibility: visible;
        }

        /* Bottom Sheet Modal Container */
        .bottom-sheet {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            background: #ffffff;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
            transform: translateY(100%);
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 1001;
            max-height: 85vh;
            overflow-y: auto;
            padding: 24px;
            color: #1f2937;
        }
        @media (prefers-color-scheme: dark) {
            .bottom-sheet {
                background: #1f2937;
                color: #f3f4f6;
            }
        }
        .bottom-sheet.open {
            transform: translateY(0);
        }

        /* Sheet Drag Handle Style */
        .bottom-sheet::before {
            content: '';
            display: block;
            width: 40px;
            height: 5px;
            background: #d1d5db;
            border-radius: 3px;
            margin: -12px auto 18px auto;
        }
        @media (prefers-color-scheme: dark) {
            .bottom-sheet::before {
                background: #4b5563;
            }
        }

        /* Header layout for Bottom Sheet */
        .sheet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .sheet-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0;
        }
        .sheet-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }

        /* Structured Form Control styling */
        .form-group {
            margin-bottom: 16px;
        }
        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 6px;
            color: #4b5563;
        }
        @media (prefers-color-scheme: dark) {
            .form-label {
                color: #9ca3af;
            }
        }
        .form-input, .form-textarea, .form-select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.95rem;
            background: #ffffff;
            color: inherit;
            box-sizing: border-box;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        @media (prefers-color-scheme: dark) {
            .form-input, .form-textarea, .form-select {
                border-color: #4b5563;
                background: #374151;
            }
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
            outline: none;
            border-color: #B08D57;
            box-shadow: 0 0 0 3px rgba(176, 141, 87, 0.25);
        }

        /* Adaptive Action Button configuration */
        .sheet-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 24px;
        }
        .sheet-actions.three-buttons {
            grid-template-columns: 1fr;
        }
        .sheet-actions.three-buttons .btn-primary {
            grid-row: 1;
        }
        .sheet-actions.three-buttons .btn-secondary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 12px;
        }
        
        .btn {
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: center;
            cursor: pointer;
            border: none;
            transition: opacity 0.2s;
        }
        .btn:hover {
            opacity: 0.95;
        }
        .btn-primary {
            background: #B08D57;
            color: #ffffff;
        }
        .btn-secondary {
            background: #e5e7eb;
            color: #374151;
        }
        @media (prefers-color-scheme: dark) {
            .btn-secondary {
                background: #4b5563;
                color: #f3f4f6;
            }
        }
        .btn-danger {
            background: #ef4444;
            color: #ffffff;
        }
        .btn-success {
            background: #10b981;
            color: #ffffff;
        }

        /* Enhanced styling for dynamic Settings Card views */
        .settings-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        @media (prefers-color-scheme: dark) {
            .settings-card {
                background: #1f2937;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
        }
        .settings-card h3 {
            margin-top: 0;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .settings-card p {
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 16px;
        }
        @media (prefers-color-scheme: dark) {
            .settings-card p {
                color: #9ca3af;
            }
        }
    `;
    document.head.appendChild(style);
};

// ==========================================================
// BOTTOM SHEET ACTIONS & SETUP
// ==========================================================
function setupBottomSheet() {
    let backdrop = document.getElementById("bottomSheetBackdrop");
    let sheet = document.getElementById("bottomSheet");

    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "bottomSheetBackdrop";
        backdrop.className = "bottom-sheet-backdrop";
        document.body.appendChild(backdrop);
    }

    if (!sheet) {
        sheet = document.createElement("div");
        sheet.id = "bottomSheet";
        sheet.className = "bottom-sheet";
        document.body.appendChild(sheet);
    }

    backdrop.addEventListener("click", closeBottomSheet);
}

function openBottomSheetForCreate(type) {
    closeFab();
    const sheet = document.getElementById("bottomSheet");
    const backdrop = document.getElementById("bottomSheetBackdrop");
    if (!sheet || !backdrop) return;

    let defaultTitle = "";
    let defaultDesc = "";
  
    
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    switch (type.toLowerCase()) {
        case "payment":
            defaultTitle = "Collect Room Payment";
            defaultDesc = "Verify card details or UPI transaction reference.";
            
            break;
        case "maintenance":
            defaultTitle = "Fix AC Leak";
            defaultDesc = "Water dripping on floor near wardrobe.";
            
            break;
        case "complaint":
            defaultTitle = "Noisy Neighbor Complaint";
            defaultDesc = "Guest complained about loud music in adjacent room.";
           
            break;
        case "vip":
            defaultTitle = "VIP Guest Check-in Prep";
            defaultDesc = "Ensure fresh fruit platter and hand-written welcome note are placed in room.";
           
            break;
        case "birthday":
            defaultTitle = "Birthday Amenities Setup";
            defaultDesc = "Deliver complimentary cake and setup room decor.";
            
            break;
        case "pickup":
            defaultTitle = "Airport Pickup Request";
            defaultDesc = "Flight arriving at 15:30. Coordinate hotel cab driver.";
            
            break;
        case "spa":
            defaultTitle = "Spa Treatment Booking Setup";
            defaultDesc = "Confirm 60-min Swedish massage treatment appointment.";
            
            break;
        case "laundry":
            defaultTitle = "Express Laundry Pickup";
            defaultDesc = "Collect laundry bag from room door and deliver before evening.";
            
            break;
        case "reminder":
            defaultTitle = "Wake-up Call Request";
            defaultDesc = "Call guest to prompt wake-up at 06:00 AM sharp.";
            
            break;
        default:
            defaultTitle = "";
            defaultDesc = "";
            
    }

    sheet.innerHTML = `
        <div class="sheet-header">
            <h3 class="sheet-title">New Note</h3>
            <button class="sheet-close" id="closeSheetBtn">&times;</button>
        </div>
        <form id="createTaskForm">
            <div class="form-group">
                <label class="form-label">Room Number</label>
                <input type="text" class="form-input" id="sheetRoom" required placeholder="e.g. 302, Suite 4">
            </div>
            <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" class="form-input" id="sheetTitle" required value="${defaultTitle}" placeholder="What needs to be done?">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="sheetDesc" rows="3" placeholder="Add optional details...">${defaultDesc}</textarea>
            </div>
 
           
            <div class="form-group" id="priorityGroup">
                <label class="form-label">Priority</label>
                <select class="form-select" id="sheetPriority">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Department</label>
                <select class="form-select" id="sheetDept">
                    <option value="Reception" selected>Reception</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="F&B">Food & Beverage</option>
                    <option value="Spa">Spa & Gym</option>
                    <option value="Security">Security</option>
                </select>
            </div>
            <div class="sheet-actions">
                <button type="button" class="btn btn-secondary" id="cancelSheetBtn">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Note</button>
            </div>
        </form>
    `;

    document.getElementById("closeSheetBtn").addEventListener("click", closeBottomSheet);
    document.getElementById("cancelSheetBtn").addEventListener("click", closeBottomSheet);
    document.getElementById("createTaskForm").addEventListener("submit", (e) => {
        e.preventDefault();
        saveNewTask(type);
    });

const room = document.getElementById("sheetRoom");
const title = document.getElementById("sheetTitle");
const desc = document.getElementById("sheetDesc");

if (room && title && desc) {

    room.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            title.focus();
        }
    });

    title.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            desc.focus();
        }
    });

    desc.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            document.getElementById("createTaskForm").requestSubmit();
        }
    });

}
    backdrop.classList.add("open");
    sheet.classList.add("open");
    document.getElementById("sheetRoom")?.focus();
}

function openBottomSheetForEdit(taskId) {
    closeFab();
    const task = store.get(taskId);
    if (!task) rsaveNewTasketurn;

    const sheet = document.getElementById("bottomSheet");
    const backdrop = document.getElementById("bottomSheetBackdrop");
    if (!sheet || !backdrop) return;

    const formattedType = task.type.charAt(0).toUpperCase() + task.type.slice(1);

    sheet.innerHTML = `
        <div class="sheet-header">
            <h3 class="sheet-title">Task Details: ${formattedType}</h3>
            <button class="sheet-close" id="closeSheetBtn">&times;</button>
        </div>
        <form id="editTaskForm">
            <div class="form-group">
                <label class="form-label">Room Number</label>
                <input type="text" class="form-input" id="sheetRoom" required value="${task.room}">
            </div>
            <div class="form-group">
                <label class="form-label">Task Title</label>
                <input type="text" class="form-input" id="sheetTitle" required value="${task.title}">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="sheetDesc" rows="3">${task.description}</textarea>
            </div>

           
            <div class="form-group" id="statusGroup">
                <label class="form-label">Status</label>
                <select class="form-select" id="sheetStatus">
                    <option value="Open" ${task.status === "Open" ? "selected" : ""}>Open</option>
                    <option value="Assigned" ${task.status === "Assigned" ? "selected" : ""}>Assigned</option>
                    <option value="Acknowledged" ${task.status === "Acknowledged" ? "selected" : ""}>In Progress</option>
                    <option value="Waiting" ${task.status === "Waiting" ? "selected" : ""}>Waiting</option>
                    <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
                </select>
            </div>
            <div class="form-group" id="priorityGroup">
                <label class="form-label">Priority</label>
                <select class="form-select" id="sheetPriority">
                    <option value="Low" ${task.priority === "Low" ? "selected" : ""}>Low</option>
                    <option value="Medium" ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
                    <option value="High" ${task.priority === "High" ? "selected" : ""}>High</option>
                    <option value="Urgent" ${task.priority === "Urgent" ? "selected" : ""}>Urgent</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Department</label>
                <select class="form-select" id="sheetDept">
                    <option value="Reception" ${task.department === "Reception" ? "selected" : ""}>Reception</option>
                    <option value="Housekeeping" ${task.department === "Housekeeping" ? "selected" : ""}>Housekeeping</option>
                    <option value="Maintenance" ${task.department === "Maintenance" ? "selected" : ""}>Maintenance</option>
                    <option value="F&B" ${task.department === "F&B" ? "selected" : ""}>Food & Beverage</option>
                    <option value="Spa" ${task.department === "Spa" ? "selected" : ""}>Spa & Gym</option>
                    <option value="Security" ${task.department === "Security" ? "selected" : ""}>Security</option>
                </select>
            </div>
            
            <div class="sheet-actions">
    <button type="submit" class="btn btn-primary">
        Save Changes
    </button>

    ${
        task.status !== "Completed"
            ? `<button type="button" class="btn btn-success" id="completeTaskBtn">
                    Complete
               </button>`
            : ""
    }

    <button type="button" class="btn btn-danger" id="deleteTaskBtn">
        Delete
    </button>

    <button type="button" class="btn btn-secondary" id="cancelSheetBtn">
        Cancel
    </button>
</div>
        </form>
    `;

    document.getElementById("closeSheetBtn").addEventListener("click", closeBottomSheet);
    document.getElementById("cancelSheetBtn").addEventListener("click", closeBottomSheet);
    
    const completeBtn = document.getElementById("completeTaskBtn");
    if (completeBtn) {
        completeBtn.addEventListener("click", () => {
            store.complete(taskId);
            const t = store.get(taskId);
            if (t) {
                if (!t.history) t.history = [];
                t.history.push({
                    action: "Completed",
                    by: "Current User",
                    shift: getCurrentShift(),
                    at: Date.now()
                });
                store.save();
            }
            closeBottomSheet();
            refreshAll();
            toast("Task marked as completed!");
        });
    }

    const deleteBtn = document.getElementById("deleteTaskBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            store.delete(taskId);
            closeBottomSheet();
            refreshAll();
            toast("Task permanently deleted", "info");
        });
    }

    document.getElementById("editTaskForm").addEventListener("submit", (e) => {
        e.preventDefault();
        saveEditTask(taskId);
    });


    backdrop.classList.add("open");
    sheet.classList.add("open");
}

function closeBottomSheet() {
    const sheet = document.getElementById("bottomSheet");
    const backdrop = document.getElementById("bottomSheetBackdrop");
    if (sheet) sheet.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
}


// ==========================================================
// REPORT SHEET
// ==========================================================

function openReportSheet(reportText) {

    const sheet = document.getElementById("bottomSheet");
    const backdrop = document.getElementById("bottomSheetBackdrop");

    if (!sheet || !backdrop) return;

    sheet.innerHTML = `
        <div class="sheet-header">
            <h3 class="sheet-title">📑 Shift Handover Report</h3>
            <button class="sheet-close" id="closeSheetBtn">&times;</button>
        </div>

        <pre style="
            white-space:pre-wrap;
            font-family:inherit;
            line-height:1.6;
            margin:0;
            max-height:55vh;
            overflow:auto;
        ">${reportText}</pre>

        <div class="sheet-actions">

            <button
                class="btn btn-secondary"
                id="copyReportBtn">

               📋 Copy

            </button>

            <button
                class="btn btn-primary"
                id="completeHandoverBtn">

                📤 Complete Handover

            </button>

            <button
                class="btn btn-secondary"
                id="closeReportBtn">

                Close

            </button>

        </div>
    `;

    document
        .getElementById("closeSheetBtn")
        .addEventListener("click", closeBottomSheet);

    document
        .getElementById("closeReportBtn")
        .addEventListener("click", closeBottomSheet);

    document
        .getElementById("copyReportBtn")
        .addEventListener("click", async () => {

            await navigator.clipboard.writeText(reportText);

            toast("Report copied!");

        });

      
    document
    .getElementById("completeHandoverBtn")
    .addEventListener("click", () => {

        const confirmed = confirm(
            "Complete handover?\n\nThis will hand over all pending tasks and information to the next shift."
        );

        if (!confirmed) return;

        completeHandover();

        closeBottomSheet();

        refreshAll();

        });

    backdrop.classList.add("open");
    sheet.classList.add("open");
}


// ==========================================================
// ENTRY TYPE UI
// ==========================================================


// ==========================================================
// CREATE & EDIT STATE CONTROLLERS
// ==========================================================
function saveNewTask(type) {
    const room = document.getElementById("sheetRoom").value;
    const title = document.getElementById("sheetTitle").value;
    const description = document.getElementById("sheetDesc").value;
    const priority = document.getElementById("sheetPriority").value;
    const department = document.getElementById("sheetDept").value;
    const currentShift = getCurrentShift();

    const task = {
        id: generateId(),
        type,
        room,
        title,
        description,
        department,
        priority,
        status: "Open",
        assignee: "",
        createdBy: "Current User",
        createdAt: Date.now(),
        createdShift: currentShift,
        originShift: currentShift,
        lastHandover: null, 
        handoverCount: 0,
        updatedAt: Date.now(),
        dueAt: null,
        completedAt: null,
        history: [
            {
                action: "Created",
                by: "Current User",
                shift: currentShift,
                at: Date.now()
            }
        ]
    };

    store.create(task);
    closeBottomSheet();
    refreshAll();
    toast(`${type.charAt(0).toUpperCase() + type.slice(1)} task added successfully!`);
}

function saveEditTask(taskId) {
    const room = document.getElementById("sheetRoom").value;
    const title = document.getElementById("sheetTitle").value;
    const description = document.getElementById("sheetDesc").value;
    const priority = document.getElementById("sheetPriority").value;
    const department = document.getElementById("sheetDept").value;
    const status = document.getElementById("sheetStatus").value;
    const originalTask = store.get(taskId);
    if (!originalTask) return;

    const updates = {
        room,
        title,
        description,
        priority,
        department,
        status,
        
};

    if (status === "Completed" && originalTask.status !== "Completed") {
        updates.completedAt = Date.now();
    }

    store.update(taskId, updates);

    const task = store.get(taskId);
    if (task) {

       const currentShift = getCurrentShift();

       if (!task.history) task.history = [];

    task.history.push({
        action: `Updated (${status})`,
        by: "Current User",
        shift: currentShift,
        at: Date.now()
    });

    store.save();
    }

    closeBottomSheet();
    refreshAll();
    toast("Task changes saved successfully.");
}

// ==========================================================
// RENDERERS & DATA SYNC
// ==========================================================
function renderTimelineCustom() {
    const previewEl = document.getElementById("timelinePreview");
    const containerEl = document.getElementById("timelineContainer");
    
    if (!previewEl && !containerEl) return;

    const events = [];
    store.getAll().forEach(task => {
        if (task.history) {
            task.history.forEach(item => {
                events.push({
                   time: item.at,
                   title: `${item.action} - ${task.room || "General"}`,
                   description: `${task.title}${item.shift ? ` • ${item.shift} Shift` : ""}`
                });
            });
        }
    });

    events.sort((a, b) => b.time - a.time);

    if (previewEl) {
        if (events.length === 0) {
            previewEl.innerHTML = emptyState("No Recent Activity", "Events will record here as tasks change.");
        } else {
            previewEl.innerHTML = events.slice(0, 3).map(timelineItem).join("");
        }
    }

    if (containerEl) {
        if (events.length === 0) {
            containerEl.innerHTML = emptyState("No Activities Found", "Add or edit tasks to populate the activity timeline.");
        } else {
            containerEl.innerHTML = events.map(timelineItem).join("");
        }
    }
}

function renderTasks(searchQuery = "") {
    const container = document.getElementById("tasksContainer");
    if (!container) return;

    let tasks = store.getAll();
    tasks = tasks.filter(t => t.status !== "Archived");

    if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        tasks = tasks.filter(t => 
            t.title.toLowerCase().includes(q) || 
            t.description.toLowerCase().includes(q) || 
            t.room.toLowerCase().includes(q) || 
            t.type.toLowerCase().includes(q) || 
            t.priority.toLowerCase().includes(q) || 
            t.department.toLowerCase().includes(q)
        );
    }

    if (tasks.length === 0) {
        container.innerHTML = emptyState(
            searchQuery ? "No results found" : "No active tasks",
            searchQuery ? "Try searching for something else." : "Create tasks using the + action button."
        );
        return;
    }

    container.innerHTML = tasks.map(taskCard).join("");
    
    container.querySelectorAll(".task-card").forEach(card => {
        card.addEventListener("click", () => {
            const taskId = card.dataset.id;
            openBottomSheetForEdit(taskId);
        });
    });
}

function attachDashboardClickListeners() {
    const dashboardContainer = document.getElementById("dashboardTasks");
    if (!dashboardContainer) return;
    
    dashboardContainer.querySelectorAll(".task-card").forEach(card => {
        card.addEventListener("click", () => {
            const taskId = card.dataset.id;
            openBottomSheetForEdit(taskId);
        });
    });
}

function updateStats() {
    const tasks = store.getAll();
    const attentionCountEl = document.getElementById("attentionCount");
    const taskCountEl = document.getElementById("taskCount");
    const completedTodayEl = document.getElementById("completedToday");
    const upcomingCountEl = document.getElementById("upcomingCount");

    const attentionCount = tasks.filter(t => t.status === "Open" && (t.priority === "High" || t.priority === "Urgent")).length;
    const activeTasks = tasks.filter(t => t.status !== "Completed" && t.status !== "Archived").length;
    const startOfToday = new Date().setHours(0,0,0,0);
    const completedToday = tasks.filter(t => t.status === "Completed" && t.completedAt >= startOfToday).length;
    const upcomingCount = tasks.filter(t => t.status === "Open" && t.priority === "Medium").length;

    if (attentionCountEl) attentionCountEl.textContent = attentionCount;
    if (taskCountEl) taskCountEl.textContent = activeTasks;
    if (completedTodayEl) completedTodayEl.textContent = completedToday;
    if (upcomingCountEl) upcomingCountEl.textContent = upcomingCount;
}

function renderSettings() {
    const container = document.getElementById("settingsContainer");
    if (!container) return;

    container.innerHTML = `
        <div class="settings-card">
            <h3>Staff & Shift Configuration</h3>
            <p>Configure operational shift metrics for ShiftFlow AI.</p>
            <div class="form-group" style="margin-top: 15px;">
                <label class="form-label">Current Active Shift</label>
                <select class="form-select" id="settingsShiftSelect">
                    <option value="morning">Morning Shift (07:00 - 15:00)</option>
                    <option value="evening">Evening Shift (15:00 - 23:00)</option>
                    <option value="night" selected>Night Shift (23:00 - 07:00)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Active Duty Manager</label>
                <input type="text" class="form-input" id="settingsManagerName" value="Duty Officer">
            </div>
        </div>

        <div class="settings-card" style="margin-top: 20px;">
            <h3>Database Management</h3>
            <p>Backup or clear all active operational logs.</p>
            <div class="sheet-actions" style="grid-template-columns: 1fr 1fr; margin-top: 15px; display: flex; gap: 10px;">
                <button type="button" class="btn btn-secondary" id="settingsBackupBtn" style="flex: 1;">Backup Logs</button>
                <button type="button" class="btn btn-danger" id="settingsClearBtn" style="flex: 1;">Clear All Tasks</button>
            </div>
        </div>

        <div class="settings-card" style="margin-top: 20px; text-align: center; opacity: 0.7; font-size: 0.85rem;">
            <p>ShiftFlow AI v2.0.0 (Production Build)</p>
            <p>All data cached locally in secure sandbox storage.</p>
        </div>
    `;

    const clearBtn = document.getElementById("settingsClearBtn");
    clearBtn.addEventListener("click", () => {
        if (clearBtn.dataset.confirmed === "true") {
            store.clear();
            refreshAll();
            toast("All task data has been cleared.", "info");
            clearBtn.dataset.confirmed = "false";
            clearBtn.textContent = "Clear All Tasks";
        } else {
            clearBtn.dataset.confirmed = "true";
            clearBtn.textContent = "⚠️ Click Again to Confirm Clear";
            setTimeout(() => {
                clearBtn.dataset.confirmed = "false";
                clearBtn.textContent = "Clear All Tasks";
            }, 4000);
        }
    });

    document.getElementById("settingsBackupBtn").addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.getAll()));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `shiftflow_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast("Backup downloaded successfully!");
    });

    document.getElementById("settingsShiftSelect").addEventListener("change", (e) => {
        const val = e.target.value;
        const shiftLabel = document.querySelector(".shift-label");
        if (shiftLabel) {
            shiftLabel.textContent = val.charAt(0).toUpperCase() + val.slice(1) + " Shift";
        }
        toast(`Shift switched to ${val}`);
    });
}


function renderDashboardPreview() {

    if (!dom.dashboardTasks) return;

    const priorityOrder = {
        Urgent: 4,
        High: 3,
        Medium: 2,
        Low: 1
    };

    const tasks = store.getAll()
        .filter(task =>
            task.status !== "Completed" &&
            task.status !== "Archived"
        )
        .sort((a, b) => {

            const priorityDiff =
                (priorityOrder[b.priority] || 0) -
                (priorityOrder[a.priority] || 0);

            if (priorityDiff !== 0)
                return priorityDiff;

            return b.createdAt - a.createdAt;

        });

    if (tasks.length === 0) {

        dom.dashboardTasks.innerHTML =
            emptyState(
                "Nothing to do",
                "You're all caught up."
            );

        return;

    }

    dom.dashboardTasks.innerHTML =
        tasks
            .slice(0, 8)
            .map(taskCard)
            .join("");

}


function refreshAll() {

    updateStats();

    renderDashboardPreview();

    renderTasks(
        dom.taskSearch
            ? dom.taskSearch.value
            : ""
    );

    renderTimelineCustom();

    attachDashboardClickListeners();

}


// ==========================================================
// EVENT CONTROLLER REGISTERERS
// ==========================================================
function switchPage(pageId){
    App.currentPage = pageId;
    showPage(pageId);
    
    dom.navButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    if (pageId === "tasksPage") {
        renderTasks(dom.taskSearch ? dom.taskSearch.value : "");
    } else if (pageId === "dashboardPage") {
        refreshAll();
    } else if (pageId === "timelinePage") {
        renderTimelineCustom();
    } else if (pageId === "settingsPage") {
        renderSettings();
    }
}

function registerNavigation(){
    dom.navButtons.forEach(button => {
        button.addEventListener("click", () => {
            switchPage(button.dataset.page);
        });
    });
}

function registerActivityToggle(){

    const header = document.getElementById("activityToggle");
    const timeline = document.getElementById("timelinePreview");
    const arrow = document.getElementById("activityArrow");

    if(!header || !timeline || !arrow) return;

    header.addEventListener("click", () => {

        timeline.classList.toggle("collapsed");

        arrow.classList.toggle("open");

    });

}

function registerFab(){
    if(dom.fab){
        dom.fab.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFab();
        });
    }
    document.addEventListener("click", () => {
        closeFab();
    });
}

function toggleFab() {
    if (!dom.fabMenu) return;

    dom.fabMenu.classList.toggle("hidden");
}

function closeFab(){
    if(!dom.fabMenu) return;
    dom.fabMenu.classList.add("hidden");
}

function registerQuickActions() {
    if (!dom.fabMenu) return;
    const buttons = dom.fabMenu.querySelectorAll("button[data-type]");
    buttons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            const type = button.dataset.type;
            openBottomSheetForCreate(type);
        });
    });
}

function registerSearch() {
    const searchInput = document.getElementById("taskSearch");
    if (searchInput) {
        searchInput.addEventListener("input", debounce((e) => {
            renderTasks(e.target.value);
        }, 200));
    }
}

function registerKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeFab();
            closeBottomSheet();
        }
    });
}


// ==========================================================
// START SHIFT
// ==========================================================

function registerStartShift() {

    if (!dom.startShiftBtn) return;

    dom.startShiftBtn.addEventListener("click", () => {

        const employee =
            document
                .getElementById("employeeName")
                .value
                .trim();

        if (!employee) {

            toast("Please enter your name.", "warning");

            return;

        }

        App.session.employee = employee;

        App.session.department =
            document.getElementById("departmentSelect").value;

        App.session.shift = getCurrentShift();

        App.session.loginTime = Date.now();

        App.session.active = true;

        dom.startShiftPage.style.display = "none";

        document
            .getElementById("app")
            .classList.remove("app-locked");

        refreshAll();

        toast(
            `Welcome, ${employee}!`,
            "success"
        );

    });

}

// ==========================================================
// SHIFT HANDOVER
// ==========================================================

function completeHandover() {

    const currentShift = getCurrentShift();

    const nextShift =
        currentShift === "Morning" ? "Afternoon" :
        currentShift === "Afternoon" ? "Night" :
        "Morning";

    const now = Date.now();

    store.getAll().forEach(task => {

    if (task.status === "Completed") return;

    // Already handed over by this shift
    if (
        task.lastHandover &&
        task.lastHandover.from === currentShift
    ) {
        return;
    }

    task.lastHandover = {
        from: currentShift,
        to: nextShift,
        at: now
    };

        task.handoverCount = (task.handoverCount || 0) + 1;

        if (!task.history) task.history = [];

        task.history.push({
            action: "Handed Over",
            from: currentShift,
            to: nextShift,
            by: "Current User",
            shift: currentShift,
            at: now
        });

    });

    store.save();

    localStorage.setItem(
        "lastShiftHandover",
         JSON.stringify({
             from: currentShift,
             to: nextShift,
             at: now
       })
);     

  
    refreshAll();

    toast(`Handover completed (${currentShift} → ${nextShift})`, "success");

}

// ==========================================================
// APPLICATION INITIALIZATION
// ==========================================================
function init() {
    if (App.initialized) return;

    injectCustomStyles();
    setupBottomSheet();
    initUI();
    registerStartShift();
    registerNavigation();
    registerFab();
    registerQuickActions();
    registerSearch();
    registerKeyboardShortcuts();
    registerActivityToggle();

    dom.navButtons = document.querySelectorAll(".nav-item");
    dom.taskSearch = document.getElementById("taskSearch");

    refreshAll();

    const viewAllBtn = document.getElementById("viewAllAttention");
    if (viewAllBtn) {
        viewAllBtn.addEventListener("click", () => {
            switchPage("tasksPage");
            const searchInput = document.getElementById("taskSearch");
            if (searchInput) {
                searchInput.value = "";
                renderTasks("");
            }
        });
    }

    const profileBtn = document.getElementById("profileButton");
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            toast("Current User: Administrator (Night Duty Officer)", "info");
        });
    }

  
    const reportBtn = document.getElementById("generateReportBtn");

    if (reportBtn) {
       reportBtn.addEventListener("click", () => {

        const report = generateHandoverReport(store.getAll());

        openReportSheet(report);

        });
   } 


const endShiftBtn = document.getElementById("endShiftBtn");

if (endShiftBtn) {
    endShiftBtn.addEventListener("click", () => {

        toast("End Shift workflow coming soon...", "info");

    });
}

    const greetingText = document.getElementById("greetingText");
    if (greetingText) {
        const hrs = new Date().getHours();
        if (hrs < 12) greetingText.textContent = "☀️ Good Morning";
        else if (hrs < 18) greetingText.textContent = "🌤️ Good Afternoon";
        else greetingText.textContent = "🌙 Good Evening";
    }

    App.initialized = true;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}