/*
===========================================================
ShiftFlow AI v2
store.js

Central Data Store

Single Source of Truth

Author: ChatGPT
===========================================================
*/


// ==========================================================
// STORAGE KEY
// ==========================================================

const STORAGE_KEY = "shiftflow_tasks_v2";



// ==========================================================
// STORE
// ==========================================================

class Store {

    constructor() {

        this.tasks = [];

        this.load();

    }



    // ======================================================
    // LOAD
    // ======================================================

    load() {

        try {

            const raw = localStorage.getItem(STORAGE_KEY);

            if (raw) {

                this.tasks = JSON.parse(raw);

            }

        }

        catch (err) {

            console.error("Store Load Error", err);

            this.tasks = [];

        }

    }



    // ======================================================
    // SAVE
    // ======================================================

    save() {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(this.tasks)

        );

    }



    // ======================================================
    // CREATE
    // ======================================================

    create(task) {

        this.tasks.unshift(task);

        this.save();

    }



    // ======================================================
    // GET ALL
    // ======================================================

    getAll() {

        return [...this.tasks];

    }



    // ======================================================
    // GET ONE
    // ======================================================

    get(id) {

        return this.tasks.find(

            task => task.id === id

        );

    }



    // ======================================================
    // UPDATE
    // ======================================================

    update(id, changes) {

        const task = this.get(id);

        if (!task) return;

        Object.assign(task, changes);

        task.updatedAt = Date.now();

        this.save();

    }



    // ======================================================
    // DELETE
    // ======================================================

    delete(id) {

        this.tasks = this.tasks.filter(

            task => task.id !== id

        );

        this.save();

    }



    // ======================================================
    // CLEAR
    // ======================================================

    clear() {

        this.tasks = [];

        this.save();

    }



    // ======================================================
    // COUNTS
    // ======================================================

    countOpen() {

        return this.tasks.filter(

            task => task.status === "Open"

        ).length;

    }



    countCompleted() {

        return this.tasks.filter(

            task => task.status === "Completed"

        ).length;

    }



    // ======================================================
    // FILTER
    // ======================================================

    byType(type) {

        return this.tasks.filter(

            task => task.type === type

        );

    }



    byPriority(priority) {

        return this.tasks.filter(

            task => task.priority === priority

        );

    }



    byDepartment(department) {

        return this.tasks.filter(

            task => task.department === department

        );

    }



    // ======================================================
    // COMPLETE
    // ======================================================

    complete(id) {

        this.update(id, {

            status: "Completed",

            completedAt: Date.now()

        });

    }



    // ======================================================
    // ARCHIVE
    // ======================================================

    archive(id) {

        this.update(id, {

            status: "Archived"

        });

    }

}



// ==========================================================
// SINGLE STORE INSTANCE
// ==========================================================

const store = new Store();



// ==========================================================
// EXPORT
// ==========================================================

export default store;