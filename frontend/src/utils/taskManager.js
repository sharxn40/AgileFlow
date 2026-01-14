// Basic task manager to sync data between Dashboard and Kanban
// Uses localStorage to persist "progress" as requested by user

const STORAGE_KEY = 'agileflow_tasks';

const initialTasks = [
    { id: 'AG-101', content: 'Design Dashboard Mockups', title: 'Design Dashboard Mockups', priority: 'High', status: 'To Do', assignee: 'JD', tag: 'Design', deadline: Date.now() + 3600000 },
    { id: 'AG-103', content: 'Setup Analytics Routes', title: 'Setup Analytics Routes', priority: 'Medium', status: 'To Do', assignee: 'ME', tag: 'Dev', deadline: Date.now() + 86400000 },
    { id: 'AG-102', content: 'Implement Sidebar Component', title: 'Implement Sidebar Component', priority: 'High', status: 'In Progress', assignee: 'ME', tag: 'Frontend', deadline: Date.now() + 172800000 },
    { id: 'AG-105', content: 'Database Schema Finalization', title: 'Database Schema Finalization', priority: 'High', status: 'In Progress', assignee: 'SR', tag: 'Backend', deadline: Date.now() + 259200000 },
    { id: 'AG-104', content: 'Auth Integration Tests', title: 'Auth Integration Tests', priority: 'Low', status: 'Code Review', assignee: 'JD', tag: 'QA', deadline: Date.now() - 7200000 },
    { id: 'AG-100', content: 'Project Kickoff Meeting', title: 'Project Kickoff Meeting', priority: 'Medium', status: 'Done', assignee: 'All', tag: 'General', deadline: Date.now() - 172800000 }
];

export const getTasks = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
        return initialTasks;
    }
    return JSON.parse(stored);
};

export const saveTasks = (tasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task) => {
    const tasks = getTasks();
    const newTask = {
        ...task,
        id: task.id || `AG-${Date.now()}`,
        status: task.status || 'To Do',
        deadline: task.deadline || Date.now() + 604800000 // 1 week default
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
};

export const updateTaskStatus = (taskId, newStatus) => {
    const tasks = getTasks();
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    saveTasks(updated);
    return updated;
};

// Convert flat task list to Kanban columns format
export const getKanbanData = () => {
    const tasks = getTasks();
    const columns = {
        todo: { id: 'todo', name: 'To Do', items: [] },
        inprogress: { id: 'inprogress', name: 'In Progress', items: [] },
        review: { id: 'review', name: 'Code Review', items: [] },
        done: { id: 'done', name: 'Done', items: [] }
    };

    tasks.forEach(task => {
        // Map status to column ID
        let colId = 'todo';
        const s = task.status.toLowerCase();
        if (s.includes('progress')) colId = 'inprogress';
        else if (s.includes('review')) colId = 'review';
        else if (s.includes('done')) colId = 'done';

        // Ensure content field exists for KanbanCard
        task.content = task.content || task.title;

        columns[colId].items.push(task);
    });

    return columns;
};
