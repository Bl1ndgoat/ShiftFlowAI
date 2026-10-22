/*
===========================================================
ShiftFlow AI v2
components.js

Reusable UI Components

Author: ChatGPT
===========================================================
*/

import {
    formatDate,
    formatTime,
    escapeHtml
} from "./utils.js";



/* ==========================================================
   STATUS CHIP
========================================================== */

export function statusChip(status){

    const cls = {

        Open: "chip-open",

        Acknowledged: "chip-progress",

        Assigned: "chip-progress",

        Waiting: "chip-waiting",

        Scheduled: "chip-scheduled",

        Completed: "chip-completed",

        Archived: "chip-completed"

    };

    return `
        <span class="chip ${cls[status] || "chip-open"}">
            ${escapeHtml(status)}
        </span>
    `;

}



/* ==========================================================
   TASK CARD
========================================================== */

export function taskCard(task){

    const priorityClass = task.priority
        ? task.priority.toLowerCase()
        : "low";

    return `

    <article
        class="task-card priority-${priorityClass}"
        data-id="${task.id}">

        <div class="task-header">

            <div class="task-priority priority-${priorityClass}">
                ${escapeHtml(task.priority).toUpperCase()}
            </div>

            ${statusChip(task.status)}

        </div>

        <h3 class="task-title">
            ${escapeHtml(task.title)}
        </h3>

        <div class="task-description">
            ${escapeHtml(task.description)}
        </div>

        <div class="task-footer">

            <span class="task-room">
                Room ${escapeHtml(task.room)}
            </span>

            <span class="task-time">
                ${formatTime(task.createdAt)}
            </span>

        </div>

    </article>

    `;
}


/* ==========================================================
   TIMELINE ITEM
========================================================== */

export function timelineItem(event){

    return `

    <div class="timeline-item">

        <div class="timeline-dot"></div>

        <div class="timeline-content">

            <div class="timeline-time">

                ${formatDate(event.time)}

            </div>

            <div class="timeline-title">

                ${escapeHtml(event.title)}

            </div>

            <div class="timeline-text">

                ${escapeHtml(event.description)}

            </div>

        </div>

    </div>

    `;

}



/* ==========================================================
   EMPTY STATE
========================================================== */

export function emptyState(

    title,

    message

){

    return `

    <div class="empty-state">

        <h3>

            ${escapeHtml(title)}

        </h3>

        <p>

            ${escapeHtml(message)}

        </p>

    </div>

    `;

}