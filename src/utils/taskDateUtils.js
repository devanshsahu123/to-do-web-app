/**
 * Task Date & Recurrence Utilities
 * Handles recurring tasks (e.g. Sat, Sun repeat) matching Today, Tomorrow, Calendar dates, and Week bounds
 */

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Checks if a task is scheduled to occur on a given target calendar date.
 * If task has recurrence (e.g. repeats on Sat, Sun):
 * - If target date is a Saturday or Sunday, this task matches!
 */
export const isTaskScheduledForDate = (task, targetDateInput) => {
  if (!task || !targetDateInput) return false;
  const target = new Date(targetDateInput);
  if (isNaN(target.getTime())) return false;

  const targetYear = target.getFullYear();
  const targetMonth = target.getMonth();
  const targetDay = target.getDate();
  const targetDayOfWeek = target.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const targetDayName = DAY_NAMES[targetDayOfWeek];
  const targetLower = targetDayName.toLowerCase();

  const due = task.dueDate ? new Date(task.dueDate) : null;
  const hasValidDue = due && !isNaN(due.getTime());

  const recurrence = task.recurrence;
  const isRecurring = recurrence && recurrence.type && recurrence.type !== 'None';

  // 1. Direct one-off date match (only for non-recurring tasks)
  if (!isRecurring) {
    return (
      hasValidDue &&
      due.getFullYear() === targetYear &&
      due.getMonth() === targetMonth &&
      due.getDate() === targetDay
    );
  }

  // 2. Recurrence match
  // Effective start boundary: recurring task only applies on/after the start date
  const startObj = hasValidDue
    ? due
    : task.createdAt
    ? new Date(task.createdAt)
    : null;

  if (startObj && !isNaN(startObj.getTime())) {
    const startDayStart = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate(), 0, 0, 0);
    const targetDayStart = new Date(targetYear, targetMonth, targetDay, 0, 0, 0);
    if (targetDayStart < startDayStart) {
      return false;
    }
  }

  // Daily recurrence
  if (recurrence.type === 'Daily') {
    return true;
  }

  // Weekly or Custom day-wise recurrence (e.g. ['Sat', 'Sun'], case-insensitive & prefix match)
  if (
    recurrence.type === 'Weekly' ||
    recurrence.type === 'Custom' ||
    (recurrence.days && recurrence.days.length > 0)
  ) {
    const days = recurrence.days || [];
    // If weekly with no specific days specified, repeat on same day-of-week as due date
    if (days.length === 0 && recurrence.type === 'Weekly' && hasValidDue) {
      return due.getDay() === targetDayOfWeek;
    }

    const matchesDay = days.some((d) => {
      if (!d || typeof d !== 'string') return false;
      const lower = d.trim().toLowerCase();
      return (
        lower === targetLower ||
        lower.startsWith(targetLower) ||
        targetLower.startsWith(lower)
      );
    });

    if (matchesDay) {
      return true;
    }
  }

  // Monthly recurrence (same day of month)
  if (recurrence.type === 'Monthly' && hasValidDue) {
    if (due.getDate() === targetDay) {
      return true;
    }
  }

  return false;
};

/**
 * Checks if a task is scheduled for Today
 */
export const isTaskForToday = (task) => {
  const today = new Date();
  return isTaskScheduledForDate(task, today);
};

/**
 * Checks if a task is scheduled for Tomorrow
 */
export const isTaskForTomorrow = (task) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isTaskScheduledForDate(task, tomorrow);
};

/**
 * Checks if a task belongs to this week (Monday through Sunday)
 */
export const isTaskForThisWeek = (task) => {
  if (!task) return false;
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0);

  // Check all 7 days of this current week
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(weekStart);
    checkDate.setDate(weekStart.getDate() + i);
    if (isTaskScheduledForDate(task, checkDate)) {
      return true;
    }
  }

  return false;
};

/**
 * Checks if a task belongs to this month
 */
export const isTaskForThisMonth = (task) => {
  if (!task) return false;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // If task has recurrence, and is active on/before this month
  if (task.recurrence && task.recurrence.type && task.recurrence.type !== 'None') {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (d.getFullYear() <= currentYear && d.getMonth() <= currentMonth) {
        return true;
      }
    } else {
      return true;
    }
  }

  if (task.dueDate) {
    const d = new Date(task.dueDate);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }

  return false;
};
