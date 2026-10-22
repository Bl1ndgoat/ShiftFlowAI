/*
===========================================================
ShiftFlow AI v2
utils.js

Reusable Helper Functions

Author: ChatGPT
===========================================================
*/


// ==========================================================
// UNIQUE ID
// ==========================================================

export function generateId(prefix = "tsk") {

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

}


// ==========================================================
// DATE
// ==========================================================

export function formatDate(timestamp) {

    return new Date(timestamp).toLocaleString();

}


// ==========================================================
// TIME
// ==========================================================

export function formatTime(timestamp) {

    return new Date(timestamp).toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

}


// ==========================================================
// TODAY
// ==========================================================

export function today() {

    return Date.now();

}


// ==========================================================
// CURRENCY
// ==========================================================

export function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR"

    }).format(amount);

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

export function escapeHtml(text) {

    const div = document.createElement("div");

    div.innerText = text;

    return div.innerHTML;

}


// ==========================================================
// CLONE
// ==========================================================

export function clone(data) {

    return structuredClone(data);

}


// ==========================================================
// DEBOUNCE
// ==========================================================

export function debounce(fn, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            fn(...args);

        }, delay);

    };

}


// ==========================================================
// HAPTIC
// ==========================================================

export function vibrate(ms = 20) {

    if ("vibrate" in navigator) {

        navigator.vibrate(ms);

    }

}

/* ==========================================================
   SHIFT UTILITIES
========================================================== */

export function getCurrentShift() {

    const hour = new Date().getHours();

    if (hour >= 8 && hour < 12) {
        return "Morning";
    }

    if (hour >= 12 && hour < 21) {
        return "Afternoon";
    }

    return "Night";

}



// ==========================================================
//  HANDOVER REPORT
//===========================================================

export function generateHandoverReport(tasks) {

    const activeTasks = tasks.filter(task =>
        task.entryType !== "info" &&
        task.status !== "Completed"
    );

    const information = tasks.filter(task =>
        task.entryType === "info" &&
        task.status !== "Completed"
    );

    let report = "";

    report += "══════════════════════════════\n";
    report += "SHIFT HANDOVER\n";
    report += `Date: ${new Date().toLocaleDateString()}\n`;
    report += "══════════════════════════════\n\n";

    // ======================================================
    // ACTION REQUIRED
    // ======================================================

    report += "ACTION REQUIRED\n\n";

    if (activeTasks.length === 0) {

        report += "No pending tasks.\n\n";

    } else {

        activeTasks.forEach(task => {

            report += `📍 ${task.room || "General"}\n`;
            report += `🌙 Created: ${task.createdShift || "Unknown"} Shift\n`;
            report += `${task.title}\n`;

            if (task.description) {
                report += `${task.description}\n`;
            }

            report += "\n";

        });

    }

    report += "──────────────────────────────\n\n";

    // ======================================================
    // INFORMATION
    // ======================================================

    report += "INFORMATION\n\n";

    if (information.length === 0) {

        report += "No active information.\n";

    } else {

        information.forEach(info => {

            report += `📍 ${info.room || "General"}\n`;
            report += `🌙 Created: ${info.createdShift || "Unknown"} Shift\n`;
            report += `${info.title}\n`;

            if (info.description) {
                report += `${info.description}\n`;
            }

            report += "\n";

        });

    }

    report += "══════════════════════════════";

    return report;

}